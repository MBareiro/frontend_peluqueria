import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, merge } from 'rxjs';
import { ClientService } from '../../../services/client.service';
import { AuthService } from '../../../services/auth.service';
import { BehaviorSubject } from 'rxjs';

export interface ListClientItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone_number: string;
}

const EXAMPLE_DATA: ListClientItem[] = [];

export class ListClientDataSource extends DataSource<ListClientItem> {
  data: ListClientItem[] = EXAMPLE_DATA;
  paginator: MatPaginator | undefined;
  sort: MatSort | undefined;
  private dataSubject: BehaviorSubject<ListClientItem[]> = new BehaviorSubject<
    ListClientItem[]
  >([]);

  // Propiedad y método para el filtro
  private _filter: string = '';

  get filter(): string {
    return this._filter;
  }

  set filter(value: string) {
    this._filter = value.trim().toLowerCase();
    this.dataSubject.next(this.applyFilter(this.data)); // Aplicar el filtro y actualizar el BehaviorSubject
  }  

  constructor(private clientService: ClientService, private authService?: AuthService) {
    super();
  }

  private applyFilter(data: ListClientItem[]): ListClientItem[] {
    const filterValue = this.filter;
    return data.filter(
      (item) =>
        (item.firstName &&
          item.firstName.toLowerCase().includes(filterValue)) ||
        (item.lastName && item.lastName.toLowerCase().includes(filterValue)) ||
        (item.email && item.email.toLowerCase().includes(filterValue)) ||
        (item.phone_number &&
          item.phone_number.toLowerCase().includes(filterValue))
    );
  }

  update() {
    this.connect().subscribe(); // Actualiza la conexión con la nueva selección
  }

  connect(): Observable<ListClientItem[]> {
    if (this.paginator && this.sort) {
      // Prefer AuthService in-memory user; fallback to temporary window bridge then localStorage
      const userIdFromAuth = this.authService?.currentUserValue?.id ? String(this.authService!.currentUserValue.id) : null;
      const globalUser = (window as any).currentUser;
      const userIdFromGlobal = globalUser?.id ? String(globalUser.id) : null;
      const userId = userIdFromAuth ?? userIdFromGlobal ?? localStorage.getItem('userId');
      if (userId !== null) {
        const userIdNumber = +userId;
        this.clientService.getClients().then((data: any) => {
          const sortedData = this.getSortedData([...data]);
          const pagedData = this.getPagedData(sortedData);
          this.data = pagedData;
  
          this.paginator!.length = pagedData.length;
          this.dataSubject.next(pagedData); // Emitir datos filtrados y paginados
        });
  
        return merge(
          this.dataSubject.asObservable(),
          this.paginator.page,
          this.sort.sortChange
        ).pipe(
          map(() => {
            let filteredData = this.applyFilter([...this.data]);
            return this.getPagedData(this.getSortedData(filteredData));
          })
        );
      } else {
        // Si userId es null, maneja esta situación según tu lógica
        return merge(
          this.dataSubject.asObservable(),
          this.paginator.page,
          this.sort.sortChange
        ).pipe(
          map(() => {
            return this.getPagedData(
              this.getSortedData([...this.dataSubject.value])
            );
          })
        );
      }
    } else {
      throw Error('Please set the paginator and sort on the data source before connecting.');
    }
  }
  

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: ListClientItem[]): ListClientItem[] {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    } else {
      return data;
    }
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: ListClientItem[]): ListClientItem[] {
    if (!this.sort || !this.sort.active || this.sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      const isAsc = this.sort?.direction === 'asc';
      switch (this.sort?.active) {
        case 'firstName':
          return compare(a.firstName, b.firstName, isAsc);
        case 'id':
          return compare(+a.id, +b.id, isAsc);
        default:
          return 0;
      }
    });
  }
}

/** Simple sort comparator for example ID/Name columns (for client-side sorting). */
function compare(
  a: string | number,
  b: string | number,
  isAsc: boolean
): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
