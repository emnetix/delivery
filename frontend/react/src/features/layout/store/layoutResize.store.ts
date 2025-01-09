import { Resize } from "../../../common/util/hooks/client.type";
import { createStore } from "../../../common/util/store/store.util";

export const bodyResizeStore = createStore<Resize|undefined>(undefined);
export const windowResizeStore = createStore<Record<'innerWidth'|'innerHeight'|'outerWidth'|'outerHeight', number> | undefined>(undefined);