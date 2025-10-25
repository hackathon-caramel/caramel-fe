type CardMeta = {
  id: string;
  title: string;
  subtitle: string;
  gradient: string;
};

type CreateCardMeta = {
  kind: "create";
  gradient: string;
};

type StackItem = CardMeta | CreateCardMeta;

export type { CardMeta, CreateCardMeta, StackItem };