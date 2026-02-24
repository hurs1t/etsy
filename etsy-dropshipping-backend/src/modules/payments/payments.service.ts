import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        private supabaseService: SupabaseService,
    ) {
        const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }
        this.stripe = new Stripe(stripeKey, {
            apiVersion: '2025-01-27' as any,
        });
    }

    async createCheckoutSession(userId: string, planType: string) {
        const supabase = this.supabaseService.getClient();

        // Get user email
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('email, stripe_customer_id')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            throw new InternalServerErrorException('User not found');
        }

        let customerId = user.stripe_customer_id;

        if (!customerId) {
            // Create Stripe customer
            const customer = await this.stripe.customers.create({
                email: user.email,
                metadata: { userId },
            });
            customerId = customer.id;

            // Save stripe_customer_id to DB
            await supabase
                .from('users')
                .update({ stripe_customer_id: customerId })
                .eq('id', userId);
        }

        const priceId = this.getPriceId(planType);

        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${this.configService.get<string>('FRONTEND_URL')}/dashboard?payment=success`,
            cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/pricing?payment=cancel`,
            metadata: { userId, planType },
            subscription_data: {
                trial_period_days: 7,
                metadata: { userId, planType },
            },
        });

        return { url: session.url };
    }

    private getPriceId(planType: string): string {
        let priceId: string | undefined;
        switch (planType?.toLowerCase()) {
            case 'starter':
                priceId = this.configService.get<string>('STRIPE_PRICE_STARTER');
                break;
            case 'pro':
                priceId = this.configService.get<string>('STRIPE_PRICE_PRO');
                break;
            case 'business':
                priceId = this.configService.get<string>('STRIPE_PRICE_BUSINESS');
                break;
            default:
                throw new InternalServerErrorException('Invalid plan type');
        }

        if (!priceId) {
            throw new InternalServerErrorException(`Price ID for ${planType} is not configured`);
        }
        return priceId;
    }

    async handleWebhook(signature: string, payload: Buffer) {
        const endpointSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!endpointSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
        }

        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
        } catch (err) {
            throw new InternalServerErrorException(`Webhook Error: ${err.message}`);
        }

        const supabase = this.supabaseService.getAdminClient();

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await this.updateUserSubscription(session);
                break;
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                await this.handleSubscriptionChange(subscription);
                break;
        }

        return { received: true };
    }

    private async updateUserSubscription(session: Stripe.Checkout.Session) {
        const supabase = this.supabaseService.getAdminClient();
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;

        if (userId) {
            await supabase
                .from('users')
                .update({
                    subscription_status: 'active',
                    plan_type: planType,
                    stripe_subscription_id: session.subscription as string,
                })
                .eq('id', userId);
        }
    }

    private async handleSubscriptionChange(subscription: Stripe.Subscription) {
        const supabase = this.supabaseService.getAdminClient();
        const status = subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'inactive';

        await supabase
            .from('users')
            .update({
                subscription_status: status,
            })
            .eq('stripe_subscription_id', subscription.id);
    }
}
