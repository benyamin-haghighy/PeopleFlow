
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            map((data) => {
                const statusCode = response.statusCode;

                if (statusCode === 204) {
                    return undefined;
                }

                const { message } = this.statusAndMessage(statusCode);

                return {
                    statusCode,
                    success: true,
                    message,
                    data,
                    timestamp: new Date().toISOString(),
                    path: request.originalUrl,
                };
            }),
        );
    }

    statusAndMessage(status: number) {
        const messages: Record<number, string> = {
            200: 'درخواست با موفقیت انجام شد',
            201: 'اطلاعات با موفقیت ایجاد شد',
            202: 'درخواست دریافت شد و در حال پردازش است',
            204: 'درخواست با موفقیت انجام شد',

            400: 'درخواست نامعتبر است',
            401: 'احراز هویت انجام نشده است',
            403: 'شما اجازه دسترسی به این منبع را ندارید',
            404: 'منبع موردنظر پیدا نشد',
            405: 'متد درخواست پشتیبانی نمی‌شود',
            409: 'تداخل در اطلاعات',
            422: 'اطلاعات ارسال‌شده معتبر نیستند',
            429: 'تعداد درخواست‌ها بیش از حد مجاز است',

            500: 'خطای داخلی سرور',
            501: 'این قابلیت پیاده‌سازی نشده است',
            502: 'پاسخ نامعتبر از سرور بالادستی',
            503: 'سرویس در حال حاضر در دسترس نیست',
            504: 'زمان انتظار برای پاسخ سرور به پایان رسید',
        };

        return {
            statusCode: status,
            message: messages[status] ?? 'درخواست با موفقیت انجام شد',
        };
    }
}
