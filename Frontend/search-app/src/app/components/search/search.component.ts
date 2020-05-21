// Copyright (c) Philipp Wagner. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Component, OnInit } from '@angular/core';
import { SearchResults, SearchStateEnum, SearchQuery } from '@app/app.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, of, concat } from 'rxjs';
import { map, switchMap, filter, catchError } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { SearchService } from '@app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  control = new FormControl();

  query$: Observable<SearchQuery>;

  constructor(private httpClient: HttpClient, private searchService: SearchService) {

  }

  ngOnInit(): void {
    this.query$ = this.searchService.onSearchSubmit()
      .pipe(
        filter(query => !!query.term),
        switchMap(query =>
          concat(
            of(<SearchQuery>{ state: SearchStateEnum.Loading }),
            this.doSearch(query.term).pipe(
              map(results => <SearchQuery>{state: SearchStateEnum.Finished, data: results}),
              catchError(err => of(<SearchQuery>{ state: SearchStateEnum.Error, error: err }))
            )
          )
        )
      );
  }

  doSearch(query: string): Observable<SearchResults> {
    return this.httpClient
      .get<SearchResults>(`${environment.apiUrl}/search`, {
        params: {
          q: query
        }
      })
      .pipe(
        catchError(() => of(<SearchResults>{ query: query, results: [] }))
      );
  }
}
