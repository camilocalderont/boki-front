import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DialogConfig } from '../models/dialog.models';


@Injectable({ providedIn: 'root' })
export class DialogService {

    private dialogConfig = new Subject<DialogConfig>();
    private dialogResult = new Subject<any>();
    dialog$ = this.dialogConfig.asObservable();

    open<T = boolean | Record<string, string | number>>(config: DialogConfig): Observable<T> {
        this.dialogConfig.next(config);
        return this.dialogResult.asObservable().pipe(take(1));
    }

    close(result: any) {
        this.dialogResult.next(result);
    }
}