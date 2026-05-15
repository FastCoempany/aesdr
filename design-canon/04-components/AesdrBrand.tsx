import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { createClient } from "@/utils/supabase/server";

export default async function AesdrBrand({
  className,
  style,
  children = "AESDR",
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const href = user ? "/dashboard" : "/";

  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}
