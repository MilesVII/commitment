type GenericObject = Record<string, any>;
type StringValuesOnly<T> = {
	[P in keyof T as T[P] extends string | undefined ? P : never]: T[P];
};
type StringKeysOnly<T> = {
	[P in keyof T as P extends string ? P : never]: T[P]
}
type StringKeysAndValuesOnly<T> = {
	[P in keyof T as T[P] extends string | undefined ? (P extends string ? P : never) : never]: T[P];
};

type TagName = keyof HTMLElementTagNameMap;
type DivByDefault<T> = T extends TagName ? HTMLElementTagNameMap[T] : HTMLDivElement;

type Contents = {
	textContent: string
} | {
	children: HTMLElement[]
} | {};

export type CSSProperties = StringKeysAndValuesOnly<Partial<CSSStyleDeclaration>>;

type BuildOptions<E, S> = {
	elementName?: E,
	attributes?: GenericObject,
	className?: string,
	style?: CSSProperties,
	children?: HTMLElement[],
	textContent?: string,
	state?: S,
	prefire?: (el: DivByDefault<E>, state?: S) => void,
	events?: Record<string, (event: Event, element: DivByDefault<E>, state?: S) => void>,
} & Contents;

function TypedKeys<T extends Record<any, any>>(value: T): (keyof T)[]{
	return Object.keys(value);
}

export function buildElement<ElementType extends TagName | undefined, StateType = GenericObject>
	({
		className,
		prefire,
		children,
		style,
		attributes,
		textContent,
		events,
		state,
		elementName
	}: BuildOptions<ElementType, StateType> = {}): DivByDefault<ElementType> {
	const _state = state;
	const el = document.createElement((elementName ?? "div") as TagName) as DivByDefault<ElementType>;

	if (className) el.className = className;
	if (children)
		el.append(...children);
	else if (textContent)
		el.textContent = textContent;
	if (style)
		for (const styleKey of TypedKeys(style)){
			if (styleKey.includes("-"))
				el.style.setProperty(styleKey, style[styleKey] ?? null);
			else
				el.style[styleKey] = style[styleKey] ?? "";
		}
	if (attributes)
		for (const attributeKey of Object.keys(attributes))
			el.setAttribute(attributeKey, attributes[attributeKey]);

	if (events)
		for (const eventKey of Object.keys(events))
			el.addEventListener(eventKey, e => events[eventKey](e, el, _state));

	if (prefire) prefire(el, _state);
	return el;
}
