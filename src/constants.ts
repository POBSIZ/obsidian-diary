export const VIEW_TYPE_YEARLY_PLANNER = "yearly-planner-view";
export const VIEW_TYPE_MONTHLY_PLANNER = "monthly-planner-view";

export const MONTH_LABELS_KO = [
	"1월", "2월", "3월", "4월", "5월", "6월",
	"7월", "8월", "9월", "10월", "11월", "12월",
] as const;

export const MONTH_LABELS_EN = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export const WEEKEND_LABELS_KO = { sat: "토", sun: "일" } as const;
export const WEEKEND_LABELS_EN = { sat: "Sat", sun: "Sun" } as const;

/** 월간 뷰 요일 헤더 (일요일 시작): 일, 월, ... 토 */
export const WEEKDAY_LABELS_KO = [
	"일", "월", "화", "수", "목", "금", "토",
] as const;
export const WEEKDAY_LABELS_EN = [
	"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
] as const;
