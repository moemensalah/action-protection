import nodemailer from 'nodemailer';
import { storage } from './storage';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: string;
    subtotal: string;
  }>;
  totalAmount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

class EmailService {
  private async getEmailConfig(): Promise<EmailConfig | null> {
    try {
      const smtpSettings = await storage.getSmtpSettings();
      if (!smtpSettings || !smtpSettings.enabled) {
        return null;
      }

      return {
        host: smtpSettings.host,
        port: smtpSettings.port,
        secure: smtpSettings.secure,
        auth: {
          user: smtpSettings.username,
          pass: smtpSettings.password,
        },
      };
    } catch (error) {
      console.error('Error getting email config:', error);
      return null;
    }
  }

  private async createTransporter() {
    const config = await this.getEmailConfig();
    if (!config) {
      throw new Error('Email service not configured or disabled');
    }

    return nodemailer.createTransport(config);
  }

  private generateOrderEmailTemplate(orderData: OrderEmailData, isAdmin: boolean = false): { subject: string; html: string } {
    const isArabic = false; // You can determine language preference here
    
    if (isAdmin) {
      return {
        subject: `New Order Received - ${orderData.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f97316; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; }
              .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
              .item { border-bottom: 1px solid #eee; padding: 10px 0; }
              .total { font-weight: bold; font-size: 18px; color: #f97316; }
              .footer { text-align: center; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚗 Action Protection</h1>
                <h2>New Order Received</h2>
              </div>
              
              <div class="content">
                <div class="order-details">
                  <h3>Order Information</h3>
                  <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                  <p><strong>Date:</strong> ${orderData.createdAt}</p>
                  <p><strong>Status:</strong> ${orderData.status}</p>
                  <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
                </div>

                <div class="order-details">
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> ${orderData.customerName}</p>
                  <p><strong>Email:</strong> ${orderData.customerEmail}</p>
                  <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
                  <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
                </div>

                <div class="order-details">
                  <h3>Order Items</h3>
                  ${orderData.items.map(item => `
                    <div class="item">
                      <strong>${item.productName}</strong><br>
                      Quantity: ${item.quantity} × ${item.price} KWD = ${item.subtotal} KWD
                    </div>
                  `).join('')}
                  <div class="total">
                    Total Amount: ${orderData.totalAmount} KWD
                  </div>
                </div>
              </div>

              <div class="footer">
                <p>Action Protection - Premium Vehicle Protection Services</p>
                <p>Login to admin panel to manage this order</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
    } else {
      return {
        subject: `Order Confirmation - ${orderData.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #f97316; color: white; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 20px; }
              .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
              .item { border-bottom: 1px solid #eee; padding: 10px 0; }
              .total { font-weight: bold; font-size: 18px; color: #f97316; }
              .footer { text-align: center; color: #666; margin-top: 20px; }
              .status { background: #e3f2fd; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚗 Action Protection</h1>
                <h2>Order Confirmation</h2>
              </div>
              
              <div class="content">
                <p>Dear ${orderData.customerName},</p>
                <p>Thank you for choosing Action Protection! Your order has been successfully placed.</p>

                <div class="status">
                  <strong>Current Status:</strong> ${orderData.status}
                </div>

                <div class="order-details">
                  <h3>Order Details</h3>
                  <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                  <p><strong>Order Date:</strong> ${orderData.createdAt}</p>
                  <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
                  <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
                </div>

                <div class="order-details">
                  <h3>Services Ordered</h3>
                  ${orderData.items.map(item => `
                    <div class="item">
                      <strong>${item.productName}</strong><br>
                      Quantity: ${item.quantity} × ${item.price} KWD = ${item.subtotal} KWD
                    </div>
                  `).join('')}
                  <div class="total">
                    Total Amount: ${orderData.totalAmount} KWD
                  </div>
                </div>

                <p>We will contact you soon to confirm your appointment and provide further details about your vehicle protection services.</p>
                <p>If you have any questions, please don't hesitate to contact us.</p>
              </div>

              <div class="footer">
                <p>Action Protection - Premium Vehicle Protection Services</p>
                <p>Phone: +965 2245 0123 | WhatsApp: +965 5555 0123</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
    }
  }

  private generateStatusUpdateTemplate(orderData: OrderEmailData, newStatus: string): { subject: string; html: string } {
    const statusMessages = {
      pending: 'Your order is pending review',
      confirmed: 'Your order has been confirmed',
      preparing: 'We are preparing your service',
      ready: 'Your service is ready',
      delivered: 'Your order has been completed',
      cancelled: 'Your order has been cancelled'
    };

    const statusColors = {
      pending: '#fbbf24',
      confirmed: '#10b981',
      preparing: '#3b82f6',
      ready: '#8b5cf6',
      delivered: '#059669',
      cancelled: '#ef4444'
    };

    return {
      subject: `Order Status Update - ${orderData.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .status-update { background: ${statusColors[newStatus] || '#f97316'}; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .order-details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 Action Protection</h1>
              <h2>Order Status Update</h2>
            </div>
            
            <div class="content">
              <p>Dear ${orderData.customerName},</p>
              
              <div class="status-update">
                <h3>Status Updated: ${newStatus.toUpperCase()}</h3>
                <p>${statusMessages[newStatus] || 'Your order status has been updated'}</p>
              </div>

              <div class="order-details">
                <h3>Order Information</h3>
                <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
                <p><strong>Total Amount:</strong> ${orderData.totalAmount} KWD</p>
                <p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>
              </div>

              ${newStatus === 'confirmed' ? `
                <p>Great news! Your order has been confirmed. Our team will contact you within 24 hours to schedule your appointment.</p>
              ` : newStatus === 'preparing' ? `
                <p>We are now preparing your vehicle protection services. Our technicians are getting everything ready for your appointment.</p>
              ` : newStatus === 'ready' ? `
                <p>Your service is ready! Please contact us to schedule the completion of your vehicle protection services.</p>
              ` : newStatus === 'delivered' ? `
                <p>Congratulations! Your vehicle protection services have been completed. Thank you for choosing Action Protection!</p>
              ` : newStatus === 'cancelled' ? `
                <p>Your order has been cancelled. If you have any questions, please contact our customer service team.</p>
              ` : ''}

              <p>If you have any questions about your order, please don't hesitate to contact us.</p>
            </div>

            <div class="footer">
              <p>Action Protection - Premium Vehicle Protection Services</p>
              <p>Phone: +965 2245 0123 | WhatsApp: +965 5555 0123</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  async sendOrderConfirmationEmails(orderData: OrderEmailData): Promise<{ adminSent: boolean; customerSent: boolean }> {
    try {
      const transporter = await this.createTransporter();
      const smtpSettings = await storage.getSmtpSettings();
      
      if (!smtpSettings) {
        throw new Error('SMTP settings not found');
      }

      let adminSent = false;
      let customerSent = false;

      // Send email to admin
      if (smtpSettings.adminEmail) {
        try {
          const adminEmail = this.generateOrderEmailTemplate(orderData, true);
          await transporter.sendMail({
            from: `"Action Protection" <${smtpSettings.username}>`,
            to: smtpSettings.adminEmail,
            subject: adminEmail.subject,
            html: adminEmail.html,
          });
          adminSent = true;
          console.log('Order notification email sent to admin:', smtpSettings.adminEmail);
        } catch (error) {
          console.error('Error sending admin email:', error);
        }
      }

      // Send email to customer
      if (orderData.customerEmail) {
        try {
          const customerEmail = this.generateOrderEmailTemplate(orderData, false);
          await transporter.sendMail({
            from: `"Action Protection" <${smtpSettings.username}>`,
            to: orderData.customerEmail,
            subject: customerEmail.subject,
            html: customerEmail.html,
          });
          customerSent = true;
          console.log('Order confirmation email sent to customer:', orderData.customerEmail);
        } catch (error) {
          console.error('Error sending customer email:', error);
        }
      }

      return { adminSent, customerSent };
    } catch (error) {
      console.error('Error in sendOrderConfirmationEmails:', error);
      return { adminSent: false, customerSent: false };
    }
  }

  async sendStatusUpdateEmail(orderData: OrderEmailData, newStatus: string): Promise<boolean> {
    try {
      if (!orderData.customerEmail) {
        console.log('No customer email provided for status update');
        return false;
      }

      const transporter = await this.createTransporter();
      const smtpSettings = await storage.getSmtpSettings();
      
      if (!smtpSettings) {
        throw new Error('SMTP settings not found');
      }

      const statusEmail = this.generateStatusUpdateTemplate(orderData, newStatus);
      
      await transporter.sendMail({
        from: `"Action Protection" <${smtpSettings.username}>`,
        to: orderData.customerEmail,
        subject: statusEmail.subject,
        html: statusEmail.html,
      });

      console.log('Status update email sent to customer:', orderData.customerEmail);
      return true;
    } catch (error) {
      console.error('Error sending status update email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export default emailService;