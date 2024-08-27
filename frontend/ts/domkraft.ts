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

type UpdateFunction<E, S> = (el: DivByDefault<E>, state?: S) => void;
type EventsRecord<E, S> =
	Partial<
		Record<
			keyof HTMLElementEventMap,
			(
				event: Event,
				element: DivByDefault<E>,
				state?: S,
				update?: () => void
			) => void
		>
	>;

type BuildOptions<E, S> = Partial<{
	elementName: E,
	attributes: GenericObject,
	className: string,
	style: CSSProperties,
	children: HTMLElement[],
	textContent: string,
	state: S,
	prefire: UpdateFunction<E, S>,
	update: UpdateFunction<E, S>,
	events: EventsRecord<E, S>
	
} & Contents>;

function typedKeys<T extends Record<any, any>>(value: T): (keyof T)[]{
	return Object.keys(value);
}

export function buildElement<ElementType extends TagName | undefined, StateType = GenericObject>
	({
		elementName,
		attributes,
		className,
		style,
		children,
		textContent,
		state,
		prefire,
		update,
		events
	}: BuildOptions<ElementType, StateType> = {}): DivByDefault<ElementType> {
	const el = document.createElement((elementName ?? "div") as TagName) as DivByDefault<ElementType>;

	if (className) el.className = className;
	if (children)
		el.append(...children);
	else if (textContent)
		el.textContent = textContent;
	if (style)
		for (const styleKey of typedKeys(style)){
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
			el.addEventListener(eventKey, e => events[eventKey](e, el, state, () => update?.(el, state)));

	if (prefire) prefire(el, state);
	return el;
}
