import { BrandPalette } from '@/lib/colorUtils';
import { Check } from 'lucide-react';

const PricingSection = ({ palette }: { palette: BrandPalette }) => {
    const plans = [
        {
            name: 'Starter',
            price: 'Free',
            features: ['1 palette', 'CSS export', 'Basic tokens'],
            buttonText: 'Choose Plan',
            popular: false
        },
        {
            name: 'Pro',
            price: '$19/mo',
            features: ['Unlimited palettes', 'All exports', 'Components', 'Templates'],
            buttonText: 'Choose Plan',
            popular: true
        },
        {
            name: 'Team',
            price: '$49/mo',
            features: ['Everything in Pro', 'Collaboration', 'Figma sync', 'API access'],
            buttonText: 'Choose Plan',
            popular: false
        }
    ];

    return (
        <section className="w-full bg-background section-padding mt-12 pt-12">
            <div className="max-w-[1920px] mx-auto px-12">
                <h2 className="text-3xl font-extrabold text-foreground mb-2">Pricing</h2>
                <p className="text-muted-foreground mb-12">Choose the right plan for your brand building needs.</p>

                <div className="grid grid-cols-12 gap-8">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`col-span-4 flex flex-col p-8 ${plan.popular ? 'bg-white shadow-hard relative' : 'bg-card shadow-hard-sm'}`}>
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 -translate-y-1/2">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                            <p className="text-3xl font-extrabold mb-6" style={{ color: plan.popular ? 'hsl(var(--primary-500))' : 'inherit' }}>{plan.price}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <Check className={`w-4 h-4 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full h-12 text-xs font-bold uppercase tracking-widest transition-all ${plan.popular
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                : 'bg-white border border-neutral-200 text-foreground hover:bg-neutral-50'
                                }`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
