import { AuthStatus } from '../enum/system';
import type {Permission} from './componentObj';

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