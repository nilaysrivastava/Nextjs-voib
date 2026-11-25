import {createClient} from "@/libs/supabase/server";

import { ProductWithPrice } from "@/types";

const getActiveProductsWithPrices = async (): Promise<ProductWithPrice[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")
    .order("unit_amount", { foreignTable: "prices" });

  if (error) {
    console.log(error.message);
  }

  return (data as any) || [];
};

export default getActiveProductsWithPrices;
