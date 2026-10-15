import type { NoteModule } from "../../../engine/types";
import meta from "./meta";
import Page from "./Page";
import info from "./info.md?raw";

const note: NoteModule = { ...meta, kind: "note", Page, info };
export default note;
