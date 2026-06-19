import { getDateKey } from "../../utils/date";
import { getShiftedDate } from "../../utils/huangliMock";

interface DateSwitcherProps {
  selectedDate: string;
  onChangeDate: (date: string) => void;
}

export function DateSwitcher({ selectedDate, onChangeDate }: DateSwitcherProps) {
  const today = getDateKey();
  const quickDates = [
    { label: "昨天", date: getShiftedDate(today, -1) },
    { label: "今天", date: today },
    { label: "明天", date: getShiftedDate(today, 1) },
  ];

  return (
    <div className="date-switcher section-card">
      <div className="date-switcher-buttons">
        {quickDates.map((item) => (
          <button
            type="button"
            className={selectedDate === item.date ? "is-active" : ""}
            key={item.label}
            onClick={() => onChangeDate(item.date)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label>
        选择日期
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => onChangeDate(event.target.value)}
        />
      </label>
    </div>
  );
}
