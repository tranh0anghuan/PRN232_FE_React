import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";
import { useState } from "react";
import type { MembershipPlan } from "@/services/user/home/service";
import { membershipService } from "@/services/membership-plan/service";

interface MembershipPlansProps {
  plans: MembershipPlan[];
}

export function MembershipPlans({ plans }: MembershipPlansProps) {
  const [loadingPlanId, setLoadingPlanId] = useState<number | null>(null);

  const activePlans = plans.filter((plan) => plan.isActive);

  if (activePlans.length === 0) return null;

  const handleRegister = async (planId: number) => {
    setLoadingPlanId(planId);

    try {
      const response = await membershipService.register(planId);

      if (response.code === 200) {
        console.log("Registration successful:", response.data);

        // Check if response.data is a PayPal URL and redirect automatically
        if (
          response.data &&
          typeof response.data === "string" &&
          (response.data.startsWith("http://") ||
            response.data.startsWith("https://"))
        ) {
          // Redirect to PayPal payment page
          window.location.href = response.data;
        } else {
          // Handle other success cases
          alert("Registration successful!");
        }
      } else {
        // Handle registration error
        alert(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Choose Your Support Plan
          </h2>
          <p className="text-xl text-gray-600">
            Get the level of support that's right for your quit journey
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activePlans.map((plan, index) => (
            <Card
              key={plan.planId}
              className={`border-0 shadow-lg hover:shadow-xl transition-shadow relative ${
                index === 1 ? "ring-2 ring-green-500" : ""
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.planName}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-green-600">
                    {plan.price} $
                  </div>
                  <p className="text-gray-600">for {plan.durationDays} days</p>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {Array.isArray(plan.features)
                    ? plan.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center space-x-3"
                        >
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))
                    : plan.features.split(",").map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-center space-x-3"
                        >
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">
                            {feature.trim()}
                          </span>
                        </div>
                      ))}
                </div>
                <Button
                  className={`w-full ${
                    index === 1
                      ? "!bg-green-600 !hover:bg-green-700"
                      : "!bg-gray-900 !hover:bg-gray-800"
                  }`}
                  onClick={() => handleRegister(plan.planId)}
                  disabled={loadingPlanId === plan.planId}
                >
                  {loadingPlanId === plan.planId
                    ? "Processing..."
                    : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
