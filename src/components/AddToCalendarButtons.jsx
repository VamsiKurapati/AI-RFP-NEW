import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { SiGooglecalendar } from 'react-icons/si';

const AddToCalendarButtons = ({ title, description, start, end }) => {
    // Format dates for Google Calendar (YYYYMMDDTHHmmss)
    const formatGoogleDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };

    // Format dates for Outlook Calendar (YYYYMMDDTHHmmssZ)
    const formatOutlookDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null;
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Create Google Calendar URL
    const googleCalendarUrl = () => {
        const startFormatted = formatGoogleDate(start);
        const endFormatted = formatGoogleDate(end);

        // Default to current date/time if dates are invalid
        const defaultDate = formatGoogleDate(new Date());
        const datesParam = startFormatted && endFormatted
            ? `${startFormatted}/${endFormatted}`
            : `${defaultDate}/${defaultDate}`;

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title || 'Event',
            details: description || '',
            dates: datesParam,
        });
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    // Create Outlook Calendar URL
    const outlookCalendarUrl = () => {
        const startFormatted = start ? formatOutlookDate(start) : formatOutlookDate(new Date());
        const endFormatted = end ? formatOutlookDate(end) : formatOutlookDate(new Date());

        const params = new URLSearchParams({
            subject: title || 'Event',
            body: description || '',
            startdt: startFormatted || new Date().toISOString(),
            enddt: endFormatted || new Date().toISOString(),
        });
        return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
    };

    return (
        <div className="flex gap-1 mt-1">
            {/* <a
                href={googleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                title="Add to Google Calendar"
            >
                <SiGooglecalendar className="w-3 h-3" />
            </a> */}
            <a
                href={googleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-[#4285F4] text-white text-xs rounded-md hover:bg-[#3367D6] transition shadow-sm"
            >
                <SiGooglecalendar className="w-3 h-3" />
            </a>
            <a
                href={outlookCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-[#4285F4] text-white text-xs rounded-md hover:bg-[#3367D6] transition shadow-sm"
                title="Add to Outlook Calendar"
            >
                <FaMicrosoft className="w-3 h-3" />
            </a>
        </div>
    );
};

export default AddToCalendarButtons;

