declare module '@google/nano-banana-2-webgpu' {
    export class NanoBanana2 {
        static load(url: string): Promise<{ inpaint(image: Blob, options: { prompt: string }): Promise<any> }>;
    }
}
