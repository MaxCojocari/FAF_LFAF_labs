export class AbstractSyntaxTreeNode {
    private type: string;
    private children: any;

    constructor(type: string, children: any) {
        this.type = type;
        this.children = children;
    }
}