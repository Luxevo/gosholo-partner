"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { t } from "@/lib/category-translations";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface BoostPurchaseFormProps {
  boostType: "en_vedette" | "visibilite";
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({
  boostType,
  onSuccess,
  onCancel,
}: BoostPurchaseFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { locale } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ boostType }),
      });

      const { clientSecret, amount } = await response.json();

      if (!clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setSuccess(true);
        // Afficher la confirmation plus longtemps pour que l'utilisateur puisse bien la voir
        setTimeout(() => {
          onSuccess();
        }, 3000); // 3 secondes
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const boostLabel = boostType === "en_vedette" ? t('boosts.vedette', locale) : t('boosts.visibility', locale);

  if (success) {
    return (
      <Card className="border-green-500 bg-green-50 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-3">
              {t('boostsPage.paymentSuccessful', locale)}
            </h3>
            <p className="text-lg text-green-700 mb-4">
              {t('boostsPage.yourBoost', locale)} <strong>{boostLabel}</strong> {t('boostsPage.boostAddedToAccount', locale)}
            </p>
            <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
              <p className="text-sm text-green-600 font-medium">
                ✅ 1 {t('boostsPage.creditAvailable', locale)} {boostLabel} {t('boostsPage.available', locale)}
              </p>
              <p className="text-xs text-green-500 mt-1">
                {t('boostsPage.canUseOnContent', locale)}
              </p>
            </div>
            <p className="text-sm text-green-600">
              {t('boostsPage.windowWillClose', locale)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>{t('boostsPage.purchaseBoostTitle', locale)} {boostLabel} - $5</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                },
              }}
            />
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <X className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('boostsPage.processing', locale)}
                </>
              ) : (
                t('boostsPage.pay5dollars', locale)
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
{t('boostsPage.cancel', locale)}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function BoostPurchaseForm(props: BoostPurchaseFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
