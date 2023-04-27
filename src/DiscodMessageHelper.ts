import { type APIMessageActionRowComponent } from "https://deno.land/x/discord_api_types@0.37.40/v9.ts";
import type { Snowflake, APIAttachment, APIButtonComponentWithCustomId, APIActionRowComponent, APIButtonComponentWithURL } from "https://deno.land/x/discord_api_types@0.37.40/v9.ts";
import { ButtonStyle } from "https://deno.land/x/discord_api_types@0.37.40/v9.ts";
import { DiscodMessage } from "./models.ts";

export interface ComponentsSummary {
    parentId: Snowflake;
    processed: boolean;
    label: string;
    custom_id: string;
}

export interface SplitedPrompt {
    prompt: string;
    id?: string;
    // notes?: string[];
    mode?: 'fast' | 'relaxed';
    type?: 'variations' | 'grid';
    completion?: number; // 0..1
};

export class componentData {
    public processed: boolean;
    public label: string;
    public custom_id: string;
    public url: string;

    constructor(public readonly parentId: Snowflake, src: APIButtonComponentWithCustomId | APIButtonComponentWithURL) {
        this.processed = src.style === ButtonStyle.Primary; // 1 is primary button means that it had already been click
        this.label = src.label || src.emoji?.name || "N/A";
        if ('custom_id' in src) {
            this.custom_id = src.custom_id || "";
            this.url = "";
        } else {
            this.custom_id = "";
            this.url = src.url || "";
            if (this.url)
                this.processed = true;
        }
    }
}

export function extractPrompt(content: string): SplitedPrompt | undefined {
    let m = content.match(/^\*\*(.+)\*\* - (.+)$/); // (.+) <@(\d+)>
    if (!m)
        return undefined;

    const prompt: SplitedPrompt = {
        prompt: m[1],
    }
    let extra = m[2];
    if (extra.endsWith(" (fast)")) {
        prompt.mode = "fast";
        extra = extra.substring(0, extra.length - 7);
    } else if (extra.endsWith(" (relaxed)")) {
        prompt.mode = "relaxed";
        extra = extra.substring(0, extra.length - 10);
    }
    m = extra.match(/^<@(\d+)> \(Open on website for full quality\)$/)
    if (m) {
        prompt.id = m[1];
        prompt.completion = 1;
        prompt.type = "grid";
        return prompt;
    }

    m = extra.match(/^Variations by <@(\d+)>$/)
    if (m) {
        prompt.id = m[1];
        prompt.completion = 1;
        prompt.type = "variations";
        return prompt;
    }
    m = extra.match(/^<@(\d+)>$/)
    if (m) {
        prompt.id = m[1];
        return prompt;
    }

    if (!extra.length)
        return prompt;
    console.log('failed to extract data from:', content);

    // // dual () is note, mode
    // m = content.match(/^\*\*(.+)\*\* - <@(\d+)> \(([^)])\) \(([^)])\)$/);
    // if (m)
    //     return { prompt: m[1], name: "", id: m[2], note: m[3], mode: m[4] };
    // // single () is mode
    // m = content.match(/^\*\*(.+)\*\* - <@(\d+)> \(([^)]+)\)$/);
    // if (m)
    //     return { prompt: m[1], name: "", id: m[2], note: "", mode: m[3] };
    // return prompt;
}  

function getDataFromComponents(parentId: Snowflake, srcs: APIActionRowComponent<APIMessageActionRowComponent>[]): componentData[] {
    const out: componentData[] = [];
    for (const src of srcs) {
        for (const c of src.components) {
            if ("custom_id" in c && ("label" in c || "emoji" in c)) {
                out.push(new componentData(parentId, c)); //  as APIButtonComponentWithCustomId
            } else if ("label" in c && "url" in c) {
                out.push(new componentData(parentId, c)); //  as APIButtonComponentWithURL
            } else {
                console.log(c);
            }
        }
    }
    return out;
}


export class DiscodMessageHelper {
    /**
     * content is only set if the message was not prtoperly parsed
     */
    public content?: string;
    public prompt?: SplitedPrompt;

    public author: { id: Snowflake, username: string }
    public mentions: { id: Snowflake, username: string }[];

    public attachments: APIAttachment[];
    public components: ComponentsSummary[];
    public id: Snowflake;

    constructor(msg: DiscodMessage) {
        this.id = msg.id
        this.prompt = extractPrompt(msg.content);
        if (!this.prompt) {
            this.content = msg.content;
        }
        this.author = { id: msg.author.id, username: msg.author.username };
        this.mentions = msg.mentions.map(u => ({ id: u.id, username: u.username }))
        this.attachments = msg.attachments;
        this.components = getDataFromComponents(msg.id, msg.components || []);
    }

    // isImagineResult(): boolean {
    //     if (!this.prompt)
    //         return false;
    //     if (!this.prompt.note)
    //         return false;
    //     return true;
    // }
// 
    // isUpscaleResult(): boolean {
    //     if (!this.prompt)
    //         return false;
    //     if (!this.prompt.name) // name is empty when it is a prompt
    //         return false;
    //     return true;
    // }

    getComponents(processed: boolean, name?: string): ComponentsSummary[] {
        let list = this.components.filter(a => a.processed === processed);
        if (name) {
            list = list.filter(a => a.label === name);
        }
        return list;
    }
}