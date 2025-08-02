let currentDate = new Date();

export function getCurrentYear(): number {
    return currentDate.getFullYear();
}

export function getCurrentMonth(): number {
    return currentDate.getMonth();
}

export function goToToday(): void {
    currentDate = new Date();
}

export function goToPreviousMonth(): void {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
}

export function goToNextMonth(): void {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
}

export function setCurrentDate(year: number, month: number): void {
    currentDate = new Date(year, month, 1);
}