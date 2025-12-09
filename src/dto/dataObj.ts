import { AuthStatus } from '../enum/system';
import type {Permission} from './componentObj';
import {FhirResource} from "../enum/component.ts";

export interface UserData{
	userId: string
	username: string
	pwd?: string
	pwdCheck?: string
	active?: boolean
	mail: string
	userPermissions?: Permission[]
	reviewStatus?: string
}

export interface AuthData{
	status: AuthStatus
	userId?: string
	accessToken?: string
}

export interface FhirBundle<T> {
    resourceType: string;
    entry?: Array<{
        resource: T;
        [key: string]: any;
    }>;
    [key: string]: any;
}
export class FhirBundleParser<T> {
    private bundle: FhirBundle<T>;
    constructor(bundle: FhirBundle<T>) {
        this.bundle = bundle;
    }
    getTotal(): number {
        return this.bundle.total ?? (this.bundle.entry?.length ?? 0);
    }
    getResources(): T[] {
        return this.bundle.entry?.map(e => e.resource) ?? [];
    }
}

export interface ViewerProps {
    fullUrl: string;
    resourceType: FhirResource;
}