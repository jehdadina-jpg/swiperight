import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}
export function formatDate(date) {
    return new Intl.DateTimeFormat("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}
export function formatPercentage(value) {
    return `${(value * 100).toFixed(1)}%`;
}
export function calculatePercentage(part, total) {
    if (total === 0)
        return 0;
    return (part / total) * 100;
}
