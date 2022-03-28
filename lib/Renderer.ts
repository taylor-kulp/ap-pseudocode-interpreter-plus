import { ASTNode, ExprLiteral, ExprVariable } from "./ast";
import { Token } from "./Token";
import type { InternalValue } from "./types";

export class Renderer {
	indent = 0;

	render(
		node: Token | InternalValue | ASTNode | ASTNode[]
	): Text | HTMLDetailsElement {
		console.log(node);

		if (Array.isArray(node)) {
			const details = document.createElement("details");
			const summary = document.createElement("summary");
			summary.textContent = `[${node.length}]`;
			details.appendChild(summary);

			this.indent++;

			const table = document.createElement("table");

			node.forEach((element, index) => {
				const tr = document.createElement("tr");

				const th = document.createElement("th");
				th.textContent = `${index}`;
				tr.appendChild(th);

				const td = document.createElement("td");
				td.appendChild(this.render(element));
				tr.appendChild(td);

				table.appendChild(tr);
			});

			this.indent--;

			details.appendChild(table);

			return details;

			// const ul = document.createElement("ol");
			// for (const child of node) {
			// 	const li = document.createElement("li");
			// 	li.appendChild(this.render(child));
			// 	ul.appendChild(li);
			// }
			// details.appendChild(ul);

			this.indent--;

			return details;
		}

		if (node instanceof Token) {
			return document.createTextNode(`'${node.lexeme}'`);
		}

		if (!(node instanceof ASTNode)) {
			return document.createTextNode(this.stringify(node));
		}

		if (node instanceof ExprLiteral) {
			return document.createTextNode(
				`ExprLiteral ${this.stringify(node.value)}`
			);
		}

		if (node instanceof ExprVariable) {
			return document.createTextNode(
				`ExprVariable '${node.name.lexeme}'`
			);
		}

		const details = document.createElement("details");
		const summary = document.createElement("summary");
		summary.textContent = `${node.type}`;
		details.appendChild(summary);

		this.indent++;

		const table = document.createElement("table");
		for (const [key, value] of Object.entries(node)) {
			if (key === "type" || key === "token" || key === "paren") {
				continue;
			}

			const tr = document.createElement("tr");
			const th = document.createElement("th");
			th.textContent = key;
			tr.appendChild(th);

			const td = document.createElement("td");
			td.appendChild(this.render(value));
			tr.appendChild(td);

			table.appendChild(tr);
		}

		details.appendChild(table);

		this.indent--;

		console.log(details);

		return details;

		// render += Object.keys(node).reduce((acc, key) => {
		// 	if (key === "type" || key === "token" || key === "paren") {
		// 		return acc;
		// 	}

		// 	return `${acc}\n${this.indents}${key}: ${this.render(
		// 		node[key as keyof ASTNode]
		// 	)}`;
		// }, "");

		// this.indent--;

		// return `${render}\n${this.indents}}`;
	}

	stringify(value: InternalValue) {
		if (typeof value === "string") {
			return `"${value}"`;
		}
		return `${value}`;
	}

	get indents() {
		return "  ".repeat(this.indent);
	}
}
