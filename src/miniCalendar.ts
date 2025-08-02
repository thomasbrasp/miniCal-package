import {
    getCurrentYear,
    getCurrentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    setCurrentDate
} from './utils';

export interface MiniCalendarOptions {
    onDateSelect?: (date: Date) => void;
    highlightToday?: boolean;
    showWeekNumbers?: boolean;
    disabledDates?: Date[];
    minDate?: Date;
    maxDate?: Date;
    theme?: 'light' | 'dark' | 'auto';
    locale?: string;
    firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
}

export class MiniCalendar {
    private container: HTMLElement;
    private options: MiniCalendarOptions;
    private selectedDate: Date | null = null;

    constructor(selector: string, options: MiniCalendarOptions = {}) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element with selector "${selector}" not found`);
        }
        this.container = element as HTMLElement;
        this.options = {
            highlightToday: true,
            showWeekNumbers: false,
            theme: 'auto',
            locale: 'en-US',
            firstDayOfWeek: 0,
            ...options
        };
        this.init();
    }

    private init(): void {
        this.container.className = `mini-calendar ${this.options.theme}`;
        this.render();
        this.attachEventListeners();
    }

    private render(): void {
        const year = getCurrentYear();
        const month = getCurrentMonth();

        this.container.innerHTML = `
            <div class="mini-calendar-header">
                <button class="mini-calendar-nav prev" data-action="prev">&lt;</button>
                <span class="mini-calendar-title">${this.getMonthName(month)} ${year}</span>
                <button class="mini-calendar-nav next" data-action="next">&gt;</button>
            </div>
            <div class="mini-calendar-body">
                ${this.renderWeekHeader()}
                ${this.renderDays()}
            </div>
        `;
        this.applyStyles();
    }

    private renderWeekHeader(): string {
        const days = this.options.firstDayOfWeek === 0
            ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return `
            <div class="mini-calendar-week-header">
                ${days.map(day => `<div class="mini-calendar-day-header">${day}</div>`).join('')}
            </div>
        `;
    }

    private renderDays(): string {
        const year = getCurrentYear();
        const month = getCurrentMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        let startDate = new Date(firstDay);
        const dayOfWeek = this.options.firstDayOfWeek === 0 ? firstDay.getDay() : (firstDay.getDay() + 6) % 7;
        startDate.setDate(startDate.getDate() - dayOfWeek);

        let html = '<div class="mini-calendar-days">';
        let currentDate = new Date(startDate);

        // Render 6 weeks (42 days)
        for (let i = 0; i < 42; i++) {
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = this.isToday(currentDate);
            const isSelected = this.isSelected(currentDate);
            const isDisabled = this.isDisabled(currentDate);

            const classes = [
                'mini-calendar-day',
                !isCurrentMonth ? 'other-month' : '',
                isToday && this.options.highlightToday ? 'today' : '',
                isSelected ? 'selected' : '',
                isDisabled ? 'disabled' : ''
            ].filter(Boolean).join(' ');

            html += `
                <div class="${classes}" data-date="${currentDate.toISOString().split('T')[0]}">
                    ${currentDate.getDate()}
                </div>
            `;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        html += '</div>';
        return html;
    }

    private attachEventListeners(): void {
        this.container.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            if (target.classList.contains('mini-calendar-day') && !target.classList.contains('disabled')) {
                const dateStr = target.dataset.date;
                if (dateStr) {
                    const date = new Date(dateStr);
                    this.selectDate(date);
                }
            }

            if (target.dataset.action === 'prev') {
                this.previousMonth();
            }

            if (target.dataset.action === 'next') {
                this.nextMonth();
            }
        });
    }

    private selectDate(date: Date): void {
        this.selectedDate = date;
        this.render();
        if (this.options.onDateSelect) {
            this.options.onDateSelect(date);
        }
    }

    private isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    private isSelected(date: Date): boolean {
        return this.selectedDate ? date.toDateString() === this.selectedDate.toDateString() : false;
    }

    private isDisabled(date: Date): boolean {
        if (this.options.disabledDates) {
            const isDisabled = this.options.disabledDates.some(disabledDate =>
                date.toDateString() === disabledDate.toDateString()
            );
            if (isDisabled) return true;
        }

        if (this.options.minDate && date < this.options.minDate) {
            return true;
        }

        if (this.options.maxDate && date > this.options.maxDate) {
            return true;
        }

        return false;
    }

    private getMonthName(month: number): string {
        const date = new Date(2000, month, 1);
        return date.toLocaleDateString(this.options.locale, { month: 'long' });
    }

    private applyStyles(): void {
        if (this.container.querySelector('.mini-calendar-styles')) {
            return; // Styles already applied
        }

        const style = document.createElement('style');
        style.className = 'mini-calendar-styles';
        style.textContent = `
            .mini-calendar {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                background: white;
                width: 280px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .mini-calendar.dark {
                background: #2d2d2d;
                border-color: #404040;
                color: white;
            }

            .mini-calendar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                border-bottom: 1px solid #e0e0e0;
                background: #f8f9fa;
            }

            .mini-calendar.dark .mini-calendar-header {
                background: #404040;
                border-bottom-color: #555;
            }

            .mini-calendar-nav {
                background: none;
                border: none;
                font-size: 16px;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                color: inherit;
            }

            .mini-calendar-nav:hover {
                background: rgba(0,0,0,0.1);
            }

            .mini-calendar.dark .mini-calendar-nav:hover {
                background: rgba(255,255,255,0.1);
            }

            .mini-calendar-title {
                font-weight: 600;
                font-size: 14px;
            }

            .mini-calendar-week-header {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                padding: 8px;
                background: #f8f9fa;
            }

            .mini-calendar.dark .mini-calendar-week-header {
                background: #404040;
            }

            .mini-calendar-day-header {
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                color: #666;
                padding: 4px 0;
            }

            .mini-calendar.dark .mini-calendar-day-header {
                color: #ccc;
            }

            .mini-calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                padding: 8px;
            }

            .mini-calendar-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .mini-calendar-day:hover:not(.disabled) {
                background: #e3f2fd;
            }

            .mini-calendar.dark .mini-calendar-day:hover:not(.disabled) {
                background: #555;
            }

            .mini-calendar-day.other-month {
                color: #ccc;
            }

            .mini-calendar.dark .mini-calendar-day.other-month {
                color: #666;
            }

            .mini-calendar-day.today {
                background: #2196f3;
                color: white;
                font-weight: 600;
            }

            .mini-calendar-day.selected {
                background: #1976d2;
                color: white;
                font-weight: 600;
            }

            .mini-calendar-day.disabled {
                color: #ccc;
                cursor: not-allowed;
                background: #f5f5f5;
            }

            .mini-calendar.dark .mini-calendar-day.disabled {
                color: #555;
                background: #333;
            }
        `;
        document.head.appendChild(style);
    }

    // Public methods
    public previousMonth(): void {
        goToPreviousMonth();
        this.render();
    }

    public nextMonth(): void {
        goToNextMonth();
        this.render();
    }

    public goToToday(): void {
        goToToday();
        this.render();
    }

    public goToDate(year: number, month: number): void {
        setCurrentDate(year, month);
        this.render();
    }

    public getSelectedDate(): Date | null {
        return this.selectedDate;
    }

    public destroy(): void {
        const styles = document.querySelector('.mini-calendar-styles');
        if (styles) {
            styles.remove();
        }
        this.container.innerHTML = '';
    }
}

// Helper function for quick modal calendar
export function renderMiniCal(options: MiniCalendarOptions & { target?: string } = {}): MiniCalendar {
    const target = options.target || 'body';
    const container = document.querySelector(target);

    if (!container) {
        throw new Error(`Target element "${target}" not found`);
    }

    const calendarDiv = document.createElement('div');
    calendarDiv.id = 'mini-calendar-' + Date.now();
    container.appendChild(calendarDiv);

    return new MiniCalendar(`#${calendarDiv.id}`, options);
}