import * as R from 'ramda';

export function clone(obj: {[key: string]: any}) {
    return R.clone(obj);
}
