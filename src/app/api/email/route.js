import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { to, subject, type, orderData } = await req.json();

        // 1. Configure Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 2. Define Email Templates
        let htmlContent = '';

        const headerStyle = `background-color: #1a237e; color: #ffffff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;`;
        const bodyStyle = `padding: 20px; font-family: 'Arial', sans-serif; color: #333333; line-height: 1.6; background-color: #f9fafb;`;
        const footerStyle = `text-align: center; font-size: 12px; color: #666666; padding: 20px; border-top: 1px solid #eeeeee;`;
        const buttonStyle = `display: inline-block; background-color: #1a237e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px;`;

        if (type === 'NEW_ORDER') {
            const itemsList = orderData.items.map(item =>
                `<li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br/>
                    Size: ${item.size} | Qty: ${item.quantity}
                </li>`
            ).join('');

            htmlContent = `
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" dir="rtl">
                    <div style="${headerStyle}">
                        <h1 style="margin: 0; font-size: 24px;">شكراً لطلبك!</h1>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Yarn Uniforms</p>
                    </div>
                    <div style="${bodyStyle}">
                        <h2 style="color: #1a237e;">تم استلام طلبك بنجاح</h2>
                        <p>مرحباً <strong>${orderData.customerName}</strong>،</p>
                        <p>سعداء بخدمتك! لقد استلمنا طلبك ونعمل حالياً على تجهيزه.</p>
                        
                        <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
                            <p style="margin: 0 0 10px;"><strong>رقم الطلب:</strong> ${orderData.id}</p>
                            <p style="margin: 0 0 10px;"><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
                            <p style="margin: 0;"><strong>إجمالي المبلغ:</strong> ${orderData.total} ر.س</p>
                        </div>

                        <h3 style="border-bottom: 2px solid #1a237e; padding-bottom: 5px; margin-top: 30px;">ملخص الطلب:</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${itemsList}
                        </ul>

                        <div style="text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track-order?id=${orderData.id}" style="${buttonStyle}">تتبع طلبك</a>
                        </div>
                    </div>
                    <div style="${footerStyle}">
                        <p>إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.</p>
                        <p>&copy; ${new Date().getFullYear()} Yarn Uniforms. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            `;
        } else if (type === 'STATUS_UPDATE') {
            const statusMap = {
                pending: 'قيد المراجعة',
                processing: 'قيد التجهيز',
                shipped: 'تم الشحن',
                delivered: 'تم التوصيل',
                cancelled: 'ملغي'
            };

            const statusText = statusMap[orderData.status] || orderData.status;

            htmlContent = `
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" dir="rtl">
                    <div style="${headerStyle}">
                        <h1 style="margin: 0; font-size: 24px;">تحديث حالة الطلب</h1>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Yarn Uniforms</p>
                    </div>
                    <div style="${bodyStyle}">
                        <p>مرحباً <strong>${orderData.customerName}</strong>،</p>
                        <p>نود إبلاغك بأنه تم تحديث حالة طلبك رقم <strong>#${orderData.id}</strong>.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background-color: #1a237e; color: #ffffff; padding: 10px 20px; border-radius: 50px; font-weight: bold; font-size: 18px;">
                                ${statusText}
                            </div>
                        </div>

                        <div style="text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track-order?id=${orderData.id}" style="${buttonStyle}">تتبع تفاصيل الطلب</a>
                        </div>
                    </div>
                    <div style="${footerStyle}">
                        <p>نسعد دائماً بخدمتكم.</p>
                        <p>&copy; ${new Date().getFullYear()} Yarn Uniforms. جميع الحقوق محفوظة.</p>
                    </div>
                </div>
            `;
        }

        // 3. Send Email
        await transporter.sendMail({
            from: `"Yarn Uniforms" <${process.env.SMTP_USER}>`,
            to,
            subject: subject,
            html: htmlContent,
        });

        return NextResponse.json({ success: true, message: 'Email sent successfully' }, { status: 200 });

    } catch (error) {
        console.error('Email API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
    }
}
