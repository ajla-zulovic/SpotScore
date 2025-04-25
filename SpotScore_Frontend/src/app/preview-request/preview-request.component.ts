import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { StoreUserService } from '../services/store-user.service';
import { ApiService } from '../services/api.service';
import { DateService } from '../services/date.service';
import { RequestModel } from '../interfaces/requestInterface';

@Component({
  selector: 'app-preview-request',
  templateUrl: './preview-request.component.html',
  styleUrls: ['./preview-request.component.css']
})
export class PreviewRequestComponent {
  public role: string = "";
  public requests: RequestModel[] = [];
  public selectedFilter: string = "All";

  // Dodano za paginaciju
  public pageNumber: number = 1;
  public pageSize: number = 10;
  public totalRequests: number = 0;
  public totalPages: number = 0;

  constructor(
    private auth: AuthService,
    private store: StoreUserService,
    private api: ApiService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.store.getRoleFromStore()
      .subscribe((val) => {
        const roleFromToken = this.auth.getRoleFromToken();
        this.role = val || roleFromToken;
      });

    this.loadAllRequests();
  }

  loadAllRequests() {
    this.api.getAllRequests(this.pageNumber, this.pageSize).subscribe(
      (response) => {
        this.totalRequests = response.totalRequests;
        this.totalPages = response.totalPages;
        this.requests = response.data;
        console.log("Loaded requests:", this.requests);
      },
      (error) => {
        console.error("Failed to load requests:", error);
      }
    );
  }

  filterRequests(filter: string) {
    this.selectedFilter = filter;
    this.pageNumber = 1; // resetujemo paginaciju

    if (filter === "All") {
      this.loadAllRequests();
    } else {
      console.log(`Sending request with filter: ${filter}`);
      this.api.getFilteredRequests(filter, this.pageNumber, this.pageSize).subscribe(
        (response) => {
          this.totalRequests = response.totalRequests;
          this.totalPages = response.totalPages;
          this.requests = response.data;
          console.log("Received requests:", this.requests);
        },
        (error) => {
          console.error("Failed to load requests:", error);
        }
      );
    }
  }

  markAsRead(requestId: number) {
    console.log(`Updating request status for ID: ${requestId}`);

    this.api.updateRequestStatus(requestId).subscribe(
      (response) => {
        console.log("Request marked as read:", response);

        this.filterRequests(this.selectedFilter); // refresh
      },
      (error) => {
        console.error("Failed to update request status:", error);
      }
    );
  }

  getFormattedDate(dateString: string) {
    return this.dateService.getFormattedDate(dateString, 'en-US');
  }
}
