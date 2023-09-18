import { Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { ScheduleDataSource, ScheduleItem } from './schedule-datasource';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  @ViewChild(MatTable) table!: MatTable<ScheduleItem>;
  dataSource = new ScheduleDataSource();

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['day', 'morning-active', 'morning-schedule', 'afternoon-active', 'afternoon-schedule'];
}
