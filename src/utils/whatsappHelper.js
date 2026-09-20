// WhatsApp Reminder & UPI Payment Helper for MoneyView

export function generateWhatsAppReminder({
  customerName,
  phone,
  amount,
  dueDate,
  isOverdue = false,
  storeName = "MoneyView Supermarket",
  upiId = "moneyview@icici",
  language = "hinglish"
}) {
  const formattedAmount = `₹${Number(amount).toLocaleString('en-IN')}`;
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(storeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Bill payment by ${customerName}`)}`;

  let message = "";

  if (language === "hindi" || language === "hinglish") {
    if (isOverdue) {
      message = `*Payment Reminder | ${storeName}*\n\n` +
        `नमस्ते ${customerName} जी 🙏\n\n` +
        `आपके किराना/सुपरमार्केट खाते का *${formattedAmount}* का बकाया पेमेंट ड्यू डेट (${dueDate}) से पेंडिंग है।\n\n` +
        `सप्लायर स्टॉक पेमेंट के लिए कृपया आज ही नीचे दिए गए UPI लिंक से क्लियर कर दीजिए:\n\n` +
        `📲 *UPI ID:* \`${upiId}\`\n` +
        `🔗 *Pay via UPI:* ${upiLink}\n\n` +
        `धन्यवाद,\n*${storeName}*`;
    } else {
      message = `*Namaste ${customerName} ji!* 🙏\n\n` +
        `${storeName} se aapka bill summary:\n` +
        `📌 *Pending Amount:* ${formattedAmount}\n` +
        `📅 *Due Date:* ${dueDate}\n\n` +
        `Aap aasani se neeche diye link se online pay kar sakte hain:\n` +
        `📲 *UPI ID:* \`${upiId}\`\n` +
        `🔗 *Quick Pay Link:* ${upiLink}\n\n` +
        `Aapka din shubh ho! ✨`;
    }
  } else {
    // English
    if (isOverdue) {
      message = `*Urgent Payment Reminder | ${storeName}*\n\n` +
        `Dear ${customerName},\n\n` +
        `This is a gentle reminder that your pending balance of *${formattedAmount}* is overdue since ${dueDate}.\n\n` +
        `Kindly settle this amount at your earliest via UPI to maintain an uninterrupted store credit limit:\n\n` +
        `📲 *UPI ID:* ${upiId}\n` +
        `🔗 *Direct UPI Pay:* ${upiLink}\n\n` +
        `Thank you for your business!`;
    } else {
      message = `*Payment Reminder | ${storeName}*\n\n` +
        `Dear ${customerName},\n\n` +
        `Your store purchase bill of *${formattedAmount}* is scheduled for payment on ${dueDate}.\n\n` +
        `Pay conveniently via UPI:\n` +
        `📲 *UPI ID:* ${upiId}\n` +
        `🔗 *Pay Link:* ${upiLink}\n\n` +
        `Warm regards,\n${storeName}`;
    }
  }

  // Clean phone number (strip spaces, dashes, country code prefix if needed)
  let cleanPhone = (phone || "").replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = "91" + cleanPhone;
  }

  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return {
    message,
    waUrl,
    upiLink,
    cleanPhone
  };
}
