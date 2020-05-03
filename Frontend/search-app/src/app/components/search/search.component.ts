import { Component, ViewChildren, ElementRef, QueryList, ViewChild, OnInit, HostListener } from '@angular/core';
import { SearchResults, SearchSuggestions } from '@app/app.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, empty, timer, zip, range, of } from 'rxjs';
import { map, retryWhen, mergeMap, switchMap, debounceTime, filter } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadComponent } from '@app/components/file-upload/file-upload.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  control = new FormControl();

  results$: Observable<SearchResults>;
  suggestions$: Observable<SearchSuggestions>;

  constructor(private dialog: MatDialog, private router: Router, private route: ActivatedRoute, private httpClient: HttpClient) {

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      var query = params['q'];
      if (!!query) {
        this.control.setValue(query);
        this.doSearch(query);
      }
    });

    this.suggestions$ = this.control.valueChanges
      .pipe(
        debounceTime(300), // Debounce time to not send every keystroke ...
        switchMap(value => this.getSuggestions(value))
      );
  }

  onKeyupEnter(value: string): void {
    // Instead of firing the Search directly, let's update the Route instead:
    this.router.navigate(['/search'], { queryParams: { q: value } });
  }

  doSearch(query: string): void {
    this.results$ = this.httpClient
      // Get the Results from the API:
      .get<SearchResults>(`${environment.apiUrl}/search`, {
        params: {
          q: query
        }
      })
      // ... and introduce an Exponential Backoff to retry calls:
      .pipe<SearchResults>(this.backoff(3, 250));
  }

  getSuggestions(query: string): Observable<SearchSuggestions> {
    
    if(!query) {
      return of(null);
    }
    
    if(query.length < 2) {
      return of(null);
    }

    return this.httpClient
      // Get the Results from the API:
      .get<SearchSuggestions>(`${environment.apiUrl}/suggest`, {
        params: {
          q: query
        }
      })
      // ... and introduce an Exponential Backoff to retry calls:
      .pipe<SearchSuggestions>(this.backoff(3, 250));
  }

  backoff(maxTries, ms) {
    return (src: Observable<any>) => src.pipe(
      retryWhen(attempts => zip(range(1, maxTries), attempts)
        .pipe(
          map(([i]) => i * i),
          mergeMap(i => timer(i * ms))
        )
      )
    );
  }

  openFileUploadDocument() {
    this.dialog.open(FileUploadComponent);
  }
}
