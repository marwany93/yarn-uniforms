import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);
export const dynamic = 'force-dynamic';

export async function POST(req) {
    try {
        const body = await req.json();
        const { to, orderId, customerName, items, total, status, type, schoolName, phone, message } = body;

        // --- Design & Styles ---
        const primaryColor = '#1a237e'; // Navy Blue
        const accentColor = '#D4AF37';  // Gold
        const bgColor = '#f8fafc';
        const cardColor = '#ffffff';

        // Helper to format currency
        const formatPrice = (price) => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(price);

        // --- Handle Contact Form Dual Email ---
        if (type === 'CONTACT_FORM') {
            const adminEmail = 'info@yarnuniforms.com';

            // 1. Send to Admin
            await resend.emails.send({
                from: 'Yarn Uniforms <info@yarnuniforms.com>',
                to: [adminEmail],
                subject: '📩 طلب تواصل جديد - يارن للزي الموحد',
                html: `
                    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #f8fafc;">
                        <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; border-top: 5px solid #1a237e;">
                            <h2 style="color: #1a237e;">طلب تواصل جديد</h2>
                            <p><strong>الاسم:</strong> ${customerName}</p>
                            <p><strong>المدرسة/الشركة:</strong> ${schoolName}</p>
                            <p><strong>رقم الهاتف:</strong> <span dir="ltr">${phone}</span></p>
                            <p><strong>البريد الإلكتروني:</strong> ${to}</p>
                            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
                                <strong>الرسالة/الطلب:</strong>
                                <p style="white-space: pre-wrap;">${message}</p>
                            </div>
                        </div>
                    </div>
                `,
            });

            // 2. Send Auto-Reply to Customer
            const { data, error } = await resend.emails.send({
                from: 'No-Reply <no-reply@yarnuniforms.com>',
                to: [to], // Customer email
                subject: 'شكراً لتواصلك معنا - يارن للزي الموحد',
                html: `
                    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #f8fafc;">
                        <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 10px; border-top: 5px solid #1a237e;">
                            <h2 style="color: #1a237e;">مرحباً ${customerName}،</h2>
                            <p>شكراً لتواصلك مع يارن للزي الموحد. لقد استلمنا رسالتك بنجاح وسيقوم فريقنا بمراجعتها والتواصل معك في أقرب وقت ممكن.</p>
                            <p style="color: #666; font-size: 14px; margin-top: 30px;">نسخة من رسالتك:</p>
                            <blockquote style="background: #f1f5f9; padding: 10px 15px; border-right: 4px solid #D4AF37; margin: 0; color: #555;">
                                ${message}
                            </blockquote>
                            <p style="margin-top: 30px;">مع تحيات،<br/>فريق يارن للزي الموحد</p>
                        </div>
                    </div>
                `,
            });

            if (error) return NextResponse.json({ error }, { status: 500 });
            return NextResponse.json({ message: 'Contact emails sent successfully', data });
        }

        // --- Template Generator ---
        const getEmailTemplate = () => {
            // 1. Order Confirmation Template
            if (type === 'NEW_ORDER') {
                const itemsHtml = items.map(item => `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px; color: #333;">${item.name}</td>
                        <td style="padding: 12px; color: #666; font-size: 14px;">${item.size || '-'}</td>
                        <td style="padding: 12px; font-weight: bold; color: #333;">${item.quantity}</td>
                    </tr>
                `).join('');

                return `
                    <div style="background-color: ${bgColor}; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: ${cardColor}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                            
                            <!-- Header -->
                            <div style="background-color: ${primaryColor}; padding: 30px; text-align: center;">
                                <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: bold;">شكراً لطلبك!</h1>
                                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Yarn Uniforms</p>
                            </div>

                            <!-- Body -->
                            <div style="padding: 30px;">
                                <h2 style="color: ${primaryColor}; font-size: 20px; margin-top: 0;">أهلاً ${customerName}،</h2>
                                <p style="color: #555; line-height: 1.6;">يسعدنا إبلاغك باستلام طلبك رقم <strong style="color: ${primaryColor}; background-color: #e8eaf6; padding: 2px 6px; border-radius: 4px;">#${orderId}</strong> بنجاح. نحن نعمل حالياً على تجهيزه.</p>

                                <!-- Order Summary -->
                                <div style="margin-top: 25px; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
                                    <table style="width: 100%; border-collapse: collapse; text-align: right;">
                                        <thead style="background-color: #f9fafb;">
                                            <tr>
                                                <th style="padding: 12px; color: #666; font-size: 12px; text-transform: uppercase;">المنتج</th>
                                                <th style="padding: 12px; color: #666; font-size: 12px; text-transform: uppercase;">المقاس</th>
                                                <th style="padding: 12px; color: #666; font-size: 12px; text-transform: uppercase;">العدد</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsHtml}
                                        </tbody>
                                        <tfoot style="background-color: #f9fafb;">
                                            <tr>
                                                <td colspan="2" style="padding: 15px; font-weight: bold; color: ${primaryColor};">الإجمالي</td>
                                                <td style="padding: 15px; font-weight: bold; color: ${primaryColor}; font-size: 18px;">${formatPrice(total)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <!-- CTA -->
                                <div style="text-align: center; margin-top: 35px;">
                                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track-order?id=${orderId}" style="background-color: ${accentColor}; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">تتبع طلبك</a>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                                <p style="margin: 0; color: #888; font-size: 12px;">سيتم إبلاغك بمجرد تحديث حالة الطلب.</p>
                                <p style="margin: 5px 0 0; color: #aaa; font-size: 11px;">&copy; ${new Date().getFullYear()} Yarn Uniforms. جميع الحقوق محفوظة.</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            // 2. Status Update Template
            if (type === 'STATUS_UPDATE') {
                const statusMap = {
                    pending: { text: 'قيد المراجعة', color: '#f59e0b', bg: '#fef3c7' }, // Amber
                    processing: { text: 'قيد التجهيز', color: '#3b82f6', bg: '#dbeafe' }, // Blue
                    shipped: { text: 'تم الشحن', color: '#8b5cf6', bg: '#ede9fe' }, // Purple
                    delivered: { text: 'تم التوصيل', color: '#10b981', bg: '#d1fae5' }, // Green
                    cancelled: { text: 'ملغي', color: '#ef4444', bg: '#fee2e2' } // Red
                };

                const statusInfo = statusMap[status] || { text: status, color: '#666', bg: '#eee' };

                return `
                     <div style="background-color: ${bgColor}; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: ${cardColor}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                            
                            <!-- Header -->
                            <div style="background-color: ${primaryColor}; padding: 30px; text-align: center;">
                                <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: bold;">تحديث بخصوص طلبك</h1>
                                <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">رقم الطلب #${orderId}</p>
                            </div>

                            <!-- Body -->
                            <div style="padding: 40px 30px; text-align: center;">
                                <p style="color: #666; margin-bottom: 25px; font-size: 16px;">مرحباً <strong>${customerName}</strong>،<br/>تم تحديث حالة طلبك إلى:</p>
                                
                                <div style="display: inline-block; background-color: ${statusInfo.bg}; color: ${statusInfo.color}; padding: 12px 30px; border-radius: 50px; font-weight: bold; font-size: 20px; margin-bottom: 30px;">
                                    ${statusInfo.text}
                                </div>

                                <div>
                                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track-order?id=${orderId}" style="color: ${primaryColor}; text-decoration: underline; font-weight: bold;">عرض تفاصيل الطلب</a>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                                <p style="margin: 0; color: #aaa; font-size: 11px;">&copy; ${new Date().getFullYear()} Yarn Uniforms</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            return '';
        };

        const html = getEmailTemplate();
        const subject = type === 'NEW_ORDER'
            ? `شكراً لطلبك من يارن للزي الموحد #${orderId}`
            : `تحديث حالة طلبك #${orderId}`;

        // --- Send via Resend ---

        // 1. إرسال الإيميل للعميل
        const { data, error } = await resend.emails.send({
            from: 'Yarn Uniforms <no-reply@yarnuniforms.com>', // 👈 تعديل الإيميل لـ no-reply
            to: [to],
            subject: subject,
            html: html,
        });

        // 2. إرسال إيميل التنبيه للموظف/للإدارة
        if (type === 'NEW_ORDER') {
            const adminEmail = 'info@yarnuniforms.com';

            const adminItemsHtml = items.map(item => `
                <tr>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; color: #333;">${item.name}</td>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; color: #666; direction: ltr; text-align: right;">${item.size || '-'}</td>
                    <td style="padding: 12px; border: 1px solid #cbd5e1; font-weight: bold; color: #1a237e;">${item.quantity}</td>
                </tr>
            `).join('');

            await resend.emails.send({
                from: 'Yarn Uniforms <no-reply@yarnuniforms.com>', // 👈 تعديل الإيميل لـ no-reply
                to: [adminEmail],
                subject: `🚨 طلب جديد رقم #${orderId} من: ${customerName}`,
                html: `
                    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 30px; text-align: right; background-color: #f8fafc; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 5px solid #ef4444;">
                            
                            <h2 style="color: #ef4444; margin-top: 0;">تنبيه: طلب جديد يحتاج للمراجعة 📦</h2>
                            <p style="color: #666; font-size: 16px;">تم استلام طلب جديد على النظام، يرجى مراجعته والتواصل مع العميل.</p>
                            
                            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <h3 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px;">بيانات العميل:</h3>
                                <p style="margin: 10px 0;"><strong>اسم العميل:</strong> ${customerName}</p>
                                <p style="margin: 10px 0;"><strong>المدرسة/الجهة:</strong> <span style="color: #1a237e; font-weight: bold;">${schoolName || 'غير محدد'}</span></p> <p style="margin: 10px 0;"><strong>البريد الإلكتروني:</strong> <a href="mailto:${to}" style="color: #2563eb;">${to}</a></p>
                                ${phone ? `<p style="margin: 10px 0;"><strong>رقم الهاتف:</strong> <span dir="ltr">${phone}</span></p>` : ''}
                                <p style="margin: 10px 0;"><strong>رقم الطلب:</strong> <span style="background-color: #e2e8f0; padding: 3px 8px; border-radius: 4px;">#${orderId}</span></p>
                            </div>
                            
                            <h3 style="color: #1e293b; margin-bottom: 15px;">تفاصيل المنتجات المطلوبة:</h3>
                            <table style="width: 100%; border-collapse: collapse; text-align: right;">
                                <thead style="background-color: #f1f5f9;">
                                    <tr>
                                        <th style="padding: 12px; border: 1px solid #cbd5e1; color: #475569;">المنتج</th>
                                        <th style="padding: 12px; border: 1px solid #cbd5e1; color: #475569;">المقاس والكمية</th>
                                        <th style="padding: 12px; border: 1px solid #cbd5e1; color: #475569;">العدد</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${adminItemsHtml}
                                </tbody>
                            </table>
                            
                            <div style="margin-top: 30px; text-align: center;">
                                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="background-color: #1a237e; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">الانتقال للوحة التحكم</a>
                            </div>
                            
                        </div>
                    </div>
                `
            });
        }

        if (error) {
            console.error('Resend Error:', error);
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ message: 'Emails sent successfully', data });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}