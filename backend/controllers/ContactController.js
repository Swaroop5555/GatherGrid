
import { sendEmail } from "../utils/sendEmail.js";

const escapeHTML = (value) => {
    return String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
};

export const submitContactMessage = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Validate field lengths
        if (
            name.length > 100 ||
            email.length > 254 ||
            subject.length > 150 ||
            message.length > 5000
        ) {
            return res.status(400).json({
                success: false,
                message: "One or more fields exceed the allowed length."
            });
        }

        // Prepare safe email content
        const safeName = escapeHTML(name.trim());
        const safeEmail = escapeHTML(email.trim());
        const safeSubject = escapeHTML(subject.trim());
        const safeMessage = escapeHTML(message.trim())
            .replace(/\r?\n/g, "<br>");

        // Send email to GatherGrid Admin
        await sendEmail({
            to: process.env.NEW_ADMIN_EMAIL,
            replyTo: email.trim(),
            subject: `GatherGrid Contact: ${subject.trim()}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
                    <h2 style="color: #203e81;">New Contact Message - GatherGrid</h2>

                    <p>You have received a new message through the GatherGrid website.</p>

                    <hr>

                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>

                    <h3>Message:</h3>

                    <div style="background: #f3f6fb; padding: 15px; border-radius: 8px;">
                        ${safeMessage}
                    </div>

                    <hr>

                    <p style="color: #777; font-size: 12px;">
                        This message was submitted through the GatherGrid Contact page.
                    </p>
                </div>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully. Our team will contact you soon."
        });

    } catch (error) {
        next(error);
    }
};
