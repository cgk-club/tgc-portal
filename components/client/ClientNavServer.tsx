import ClientNav from "./ClientNav";

interface ClientNavServerProps {
  active?: string;
}

export default function ClientNavServer({ active }: ClientNavServerProps) {
  return <ClientNav active={active} />;
}
