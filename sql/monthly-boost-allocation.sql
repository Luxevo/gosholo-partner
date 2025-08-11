-- Function to allocate monthly boosts to subscribed users
-- This should be run on the 1st of every month via a cron job or scheduled function

CREATE OR REPLACE FUNCTION allocate_monthly_boosts()
RETURNS void AS $$
BEGIN
  -- Update boost credits for all subscribed users
  INSERT INTO user_boost_credits (
    user_id, 
    available_en_vedette, 
    available_visibilite,
    created_at,
    updated_at
  )
  SELECT 
    p.id,
    1, -- 1 en_vedette boost
    1, -- 1 visibilite boost
    NOW(),
    NOW()
  FROM profiles p
  WHERE p.is_subscribed = true
  ON CONFLICT (user_id) 
  DO UPDATE SET
    available_en_vedette = user_boost_credits.available_en_vedette + 1,
    available_visibilite = user_boost_credits.available_visibilite + 1,
    updated_at = NOW();
    
  -- Log the number of users who received boosts
  RAISE NOTICE 'Monthly boost allocation completed for % users', 
    (SELECT COUNT(*) FROM profiles WHERE is_subscribed = true);
END;
$$ LANGUAGE plpgsql;

-- Function to automatically expire boosts older than 72 hours
CREATE OR REPLACE FUNCTION expire_boost_automatically()
RETURNS void AS $$
DECLARE
  cutoff_time timestamp with time zone;
  expired_offers_count integer;
  expired_events_count integer;
BEGIN
  -- Calculate cutoff time (72 hours ago)
  cutoff_time := NOW() - INTERVAL '72 hours';
  
  -- Expire old offer boosts
  UPDATE offers 
  SET 
    boosted = false,
    boost_type = null
  WHERE 
    boosted = true 
    AND boosted_at < cutoff_time;
    
  GET DIAGNOSTICS expired_offers_count = ROW_COUNT;
  
  -- Expire old event boosts
  UPDATE events 
  SET 
    boosted = false,
    boost_type = null
  WHERE 
    boosted = true 
    AND boosted_at < cutoff_time;
    
  GET DIAGNOSTICS expired_events_count = ROW_COUNT;
  
  -- Log the cleanup results
  RAISE NOTICE 'Boost expiry cleanup: % offers and % events expired', 
    expired_offers_count, expired_events_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a function to initialize boost credits for existing users
CREATE OR REPLACE FUNCTION initialize_user_boost_credits()
RETURNS void AS $$
BEGIN
  INSERT INTO user_boost_credits (
    user_id, 
    available_en_vedette, 
    available_visibilite,
    created_at,
    updated_at
  )
  SELECT 
    p.id,
    CASE WHEN p.is_subscribed = true THEN 1 ELSE 0 END,
    CASE WHEN p.is_subscribed = true THEN 1 ELSE 0 END,
    NOW(),
    NOW()
  FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM user_boost_credits ubc WHERE ubc.user_id = p.id
  );
  
  RAISE NOTICE 'Initialized boost credits for existing users';
END;
$$ LANGUAGE plpgsql;

-- Run this once to initialize existing users (optional)
-- SELECT initialize_user_boost_credits();