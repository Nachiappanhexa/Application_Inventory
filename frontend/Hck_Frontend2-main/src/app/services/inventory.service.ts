import { Injectable } from '@angular/core';
import { InventoryItem } from '../models/inventory.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private localUrl = 'assets/inventory.json';
  // --- Backend API methods ---
  private apiUrl = 'http://localhost:3000/inventory-items'; // Adjust base URL as needed

  constructor(private http: HttpClient) {}

  getInventory(): Observable<InventoryItem[]> { 
    return this.http.get<InventoryItem[]>(this.localUrl);
  }

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);  
  } 

  getById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getByDate(date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-date/${date}`);
  }

  getByCurrentDate(): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-current-date`);
  }

  getCurrentOptimizedReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current-optimized-report`);
  }

  // For local JSON, simulate add/update/delete in-memory (real file write not possible in browser)
  // These methods will be used for UI state only, not persistent storage
}
