declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
}


// 新增 bonFHIR React 宣告
declare module "@bonfhir/react" {
    export * from "@bonfhir/react/dist/index";
}