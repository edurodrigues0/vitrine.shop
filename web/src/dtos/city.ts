export interface City {
  id: string;
  name: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityRequest {
  name: string;
  state: string;
}

export interface UpdateCityRequest {
  name?: string;
  state?: string;
}

export interface CitiesResponse {
  cities: City[];
}

