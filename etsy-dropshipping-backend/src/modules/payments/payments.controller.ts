import { Controller, Post, Body, Req, UseGuards, Res, BadRequestException, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response, Request } from 'express';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('create-checkout-session')
    async createCheckoutSession(@Body() body: { planType: string }, @Req() req: any) {
        if (!body.planType) {
            throw new BadRequestException('Plan type is required');
        }
        return this.paymentsService.createCheckoutSession(req.user.id, body.planType);
    }

    @Post('webhook')
    async webhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
        const signature = req.headers['stripe-signature'] as string;
        const payload = req.rawBody;

        if (!signature || !payload) {
            throw new BadRequestException('Missing signature or payload');
        }

        const result = await this.paymentsService.handleWebhook(signature, payload);
        return res.status(200).json(result);
    }
}
