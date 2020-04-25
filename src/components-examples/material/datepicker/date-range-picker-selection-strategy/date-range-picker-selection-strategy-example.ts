import {Component, Injectable} from '@angular/core';
import {DateAdapter} from '@angular/material/core';
import {
  MatCalendarRangeSelectionStrategy,
  DateRange,
  MAT_CALENDAR_RANGE_SELECTION_STRATEGY,
} from '@angular/material/datepicker';

@Injectable()
export class FiveDayRangeSelectionStrategy<D> implements MatCalendarRangeSelectionStrategy<D> {
  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this._createFiveDayRange(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createFiveDayRange(activeDate);
  }

  private _createFiveDayRange(date: D | null): DateRange<D> {
    if (date) {
      const start = this._dateAdapter.addCalendarDays(date, -2);
      const end = this._dateAdapter.addCalendarDays(date, 2);
      return new DateRange<D>(start, end);
    }

    return new DateRange<D>(null, null);
  }
}

/** @title Date range picker with custom a selection strategy */
@Component({
  selector: 'date-range-picker-selection-strategy-example',
  templateUrl: 'date-range-picker-selection-strategy-example.html',
  styleUrls: ['date-range-picker-selection-strategy-example.css'],
  providers: [{
    provide: MAT_CALENDAR_RANGE_SELECTION_STRATEGY,
    useClass: FiveDayRangeSelectionStrategy
  }]
})
export class DateRangePickerSelectionStrategyExample {}
