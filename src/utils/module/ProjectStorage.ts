import { StorageMethod } from "../../dto/componentObj";
import { StorageKey } from "../../enum/system";

const localPrefix = 'local_'
const sessionPrefix = 'session_'

//沒有對應的值會是null
export const localS: StorageMethod = {
  setItem: function (key: StorageKey, value: string) {
      localStorage.setItem(`${localPrefix}${key}`, value);
  },
  getItem: function (key: StorageKey) {
      return localStorage.getItem(`${localPrefix}${key}`);
  },
  removeItem: function (key: StorageKey) {
      localStorage.removeItem(`${localPrefix}${key}`);
  }
}
export const sessionS: StorageMethod = {
  setItem: function (key: StorageKey, value: string) {
      sessionStorage.setItem(`${sessionPrefix}${key}`, value);
  },
  getItem: function (key: StorageKey) {
      return sessionStorage.getItem(`${sessionPrefix}${key}`);
  },
  removeItem: function (key: StorageKey) {
      sessionStorage.removeItem(`${sessionPrefix}${key}`);
  }
}

export default { localS, sessionS }
