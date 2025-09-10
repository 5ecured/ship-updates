export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        // year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        // second: "2-digit",
        hour12: false,
    }).replace(",", " -");
}