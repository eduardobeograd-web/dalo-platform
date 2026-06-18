import { prisma } from "../lib/db";

const SELL_MULTIPLIER = 1.65;

type Plan = {
  buyPrice: number;
  ref: string;
};

type RegionalRow = {
  regionName: string;
  isoCode: string;
  prices: Record<string, Plan>;
};

const regionalRows: RegionalRow[] = [
  {"regionName":"Africa","isoCode":"EG;MA;TZ;UG;TN;ZA;ZM;MG;NG;KE;MU;RE","prices":{"1GB/7":{"buyPrice":6.9,"ref":"esim_1GB_7D_RAF_V2"},"2GB/15":{"buyPrice":13.25,"ref":"esim_2GB_15D_RAF_V2"},"3GB/30":{"buyPrice":18.52,"ref":"esim_3GB_30D_RAF_V2"},"5GB/30":{"buyPrice":30.5,"ref":"esim_5GB_30D_RAF_V2"},"10GB/30":{"buyPrice":55.91,"ref":"esim_10GB_30D_RAF_V2"},"20GB/30":{"buyPrice":100.37,"ref":"esim_20GB_30D_RAF_V2"}}},
  {"regionName":"Americas","isoCode":"AR;BR;CL;CO;CR;EC;SV;PE;UY;GF;MX","prices":{"1GB/7":{"buyPrice":3.4,"ref":"esim_1GB_7D_RLA_V2"},"2GB/15":{"buyPrice":6.26,"ref":"esim_2GB_15D_RLA_V2"},"3GB/30":{"buyPrice":8.63,"ref":"esim_3GB_30D_RLA_V2"},"5GB/30":{"buyPrice":14.01,"ref":"esim_5GB_30D_RLA_V2"},"10GB/30":{"buyPrice":25.44,"ref":"esim_10GB_30D_RLA_V2"},"20GB/30":{"buyPrice":45.43,"ref":"esim_20GB_30D_RLA_V2"},"50GB/30":{"buyPrice":102.55,"ref":"esim_50GB_30D_RLA_V2"}}},
  {"regionName":"Asia","isoCode":"AU;HK;ID;KR;MO;MY;PK;SG;LK;TW;TH;UZ;VN;NZ","prices":{"1GB/7":{"buyPrice":2.96,"ref":"esim_1GB_7D_RAS_V2"},"2GB/15":{"buyPrice":5.38,"ref":"esim_2GB_15D_RAS_V2"},"3GB/30":{"buyPrice":7.38,"ref":"esim_3GB_30D_RAS_V2"},"5GB/30":{"buyPrice":11.93,"ref":"esim_5GB_30D_RAS_V2"},"10GB/30":{"buyPrice":21.59,"ref":"esim_10GB_30D_RAS_V2"},"20GB/30":{"buyPrice":38.5,"ref":"esim_20GB_30D_RAS_V2"},"50GB/30":{"buyPrice":86.8,"ref":"esim_50GB_30D_RAS_V2"},"100GB/30":{"buyPrice":169.26,"ref":"esim_100GB_30D_RAS_V2"}}},
  {"regionName":"Balkans","isoCode":"AL;BA;BG;GR;HR;MK;ME;RO;RS;SI;MD","prices":{"1GB/7":{"buyPrice":2.99,"ref":"esim_1GB_7D_RBK_V2"},"2GB/15":{"buyPrice":4.78,"ref":"esim_2GB_15D_RBK_V2"},"3GB/30":{"buyPrice":6.36,"ref":"esim_3GB_30D_RBK_V2"},"5GB/30":{"buyPrice":9.39,"ref":"esim_5GB_30D_RBK_V2"},"10GB/30":{"buyPrice":14.44,"ref":"esim_10GB_30D_RBK_V2"},"20GB/30":{"buyPrice":23.42,"ref":"esim_20GB_30D_RBK_V2"},"50GB/30":{"buyPrice":51.48,"ref":"esim_50GB_30D_RBK_V2"},"100GB/30":{"buyPrice":90.77,"ref":"esim_100GB_30D_RBK_V2"}}},
  {"regionName":"Caribbean","isoCode":"AW;AI;AG;BB;BM;BQ;KY;CW;DM;SV;GF;GD;GY;HT;JM;MS;AN;KN;LC;VC;TT;TC;VG;SR;DO;MQ;BL;MF","prices":{"1GB/7":{"buyPrice":6.54,"ref":"esim_1GB_7D_RCA_V2"},"2GB/15":{"buyPrice":11.63,"ref":"esim_2GB_15D_RCA_V2"},"3GB/30":{"buyPrice":16.39,"ref":"esim_3GB_30D_RCA_V2"},"5GB/30":{"buyPrice":23.7,"ref":"esim_5GB_30D_RCA_V2"},"10GB/30":{"buyPrice":40.99,"ref":"esim_10GB_30D_RCA_V2"},"20GB/30":{"buyPrice":68.99,"ref":"esim_20GB_30D_RCA_V2"}}},
  {"regionName":"CENAM","isoCode":"CR;SV;GT;HN;MX;NI;PA","prices":{"1GB/7":{"buyPrice":4.89,"ref":"esim_1GB_7D_RCE_V2"},"2GB/15":{"buyPrice":8.11,"ref":"esim_2GB_15D_RCE_V2"},"3GB/30":{"buyPrice":10.93,"ref":"esim_3GB_30D_RCE_V2"},"5GB/30":{"buyPrice":16.36,"ref":"esim_5GB_30D_RCE_V2"},"10GB/30":{"buyPrice":25.42,"ref":"esim_10GB_30D_RCE_V2"},"20GB/30":{"buyPrice":41.53,"ref":"esim_20GB_30D_RCE_V2"},"50GB/30":{"buyPrice":91.88,"ref":"esim_50GB_30D_RCE_V2"},"100GB/30":{"buyPrice":162.36,"ref":"esim_100GB_30D_RCE_V2"}}},
  {"regionName":"CIS","isoCode":"AM;KZ;KG;MD;RU;UA;GE","prices":{"1GB/7":{"buyPrice":5.45,"ref":"esim_1GB_7D_RCI_V2"},"2GB/15":{"buyPrice":9.35,"ref":"esim_2GB_15D_RCI_V2"},"3GB/30":{"buyPrice":12.77,"ref":"esim_3GB_30D_RCI_V2"},"5GB/30":{"buyPrice":19.35,"ref":"esim_5GB_30D_RCI_V2"},"10GB/30":{"buyPrice":30.32,"ref":"esim_10GB_30D_RCI_V2"},"20GB/30":{"buyPrice":49.82,"ref":"esim_20GB_30D_RCI_V2"},"50GB/30":{"buyPrice":110.75,"ref":"esim_50GB_30D_RCI_V2"},"100GB/30":{"buyPrice":196.07,"ref":"esim_100GB_30D_RCI_V2"}}},
  {"regionName":"EU+","isoCode":"AT;DK;IE;IT;SE;FR;BG;CY;EE;FI;GR;HU;LV;LT;NL;NO;PL;RO;SK;ES;GB;TR;DE;MT;CH;BE;HR;CZ;LI;LU;PT;SI;IS;IC;VA;CYP","prices":{"1GB/7":{"buyPrice":1.59,"ref":"esim_1GB_7D_REUP_V2"},"2GB/15":{"buyPrice":2.63,"ref":"esim_2GB_15D_REUP_V2"},"3GB/30":{"buyPrice":3.49,"ref":"esim_3GB_30D_REUP_V2"},"5GB/30":{"buyPrice":5.45,"ref":"esim_5GB_30D_REUP_V2"},"10GB/30":{"buyPrice":9.61,"ref":"esim_10GB_30D_REUP_V2"},"20GB/30":{"buyPrice":16.88,"ref":"esim_20GB_30D_REUP_V2"},"50GB/30":{"buyPrice":37.67,"ref":"esim_50GB_30D_REUP_V2"},"100GB/30":{"buyPrice":73.46,"ref":"esim_100GB_30D_REUP_V2"}}},
  {"regionName":"Europe Extra","isoCode":"AT;DK;IE;IT;SE;FR;BG;CY;EE;FI;GR;HU;LV;LT;NL;NO;PL;RO;SK;ES;GB;TR;DE;MT;CH;BE;HR;CZ;LI;LU;PT;SI;IS;IC;VA;CYP;MD;RS","prices":{"1GB/7":{"buyPrice":1.34,"ref":"esim_1GB_7D_REUX_V2"},"2GB/15":{"buyPrice":2.3,"ref":"esim_2GB_15D_REUX_V2"},"3GB/30":{"buyPrice":3.03,"ref":"esim_3GB_30D_REUX_V2"},"5GB/30":{"buyPrice":4.72,"ref":"esim_5GB_30D_REUX_V2"},"10GB/30":{"buyPrice":7.75,"ref":"esim_10GB_30D_REUX_V2"},"20GB/30":{"buyPrice":13.39,"ref":"esim_20GB_30D_REUX_V2"},"50GB/30":{"buyPrice":30.3,"ref":"esim_50GB_30D_REUX_V2"},"100GB/30":{"buyPrice":59.81,"ref":"esim_100GB_30D_REUX_V2"}}},
  {"regionName":"Europe Lite","isoCode":"AT;DK;IE;IT;SE;FR;BG;CY;EE;FI;GR;HU;LV;LT;NL;NO;PL;RO;SK;ES;DE;MT;CH;BE;HR;CZ;LI;LU;PT;SI;IS;IC;VA;MD","prices":{"1GB/7":{"buyPrice":1.34,"ref":"esim_1GB_7D_REUL_V2"},"2GB/15":{"buyPrice":2.3,"ref":"esim_2GB_15D_REUL_V2"},"3GB/30":{"buyPrice":3.03,"ref":"esim_3GB_30D_REUL_V2"},"5GB/30":{"buyPrice":4.72,"ref":"esim_5GB_30D_REUL_V2"},"10GB/30":{"buyPrice":7.75,"ref":"esim_10GB_30D_REUL_V2"},"20GB/30":{"buyPrice":13.39,"ref":"esim_20GB_30D_REUL_V2"},"50GB/30":{"buyPrice":30.3,"ref":"esim_50GB_30D_REUL_V2"},"100GB/30":{"buyPrice":59.81,"ref":"esim_100GB_30D_REUL_V2"}}},
  {"regionName":"Global","isoCode":"AT;DK;IE;IT;SE;IM;FR;BG;CY;EE;FI;GR;HU;LV;LT;NL;NO;PL;RO;SK;ES;GB;TR;DE;MT;CH;BE;HR;CZ;LI;LU;PT;SI;IS;UA;JE;SG;MO;HK;IL;AX;ID;VN;RU;AE;AU;TH;TW;LK;MY;PK;UZ;EG;NZ;AL;KR;CA;KZ;MD;MK;MX;GG;JO;OM;GI;MA;BR;CL;RS;JP;ME;GU;US;TZ;UG;CR;EC;NI;IN;AR;SV;PE;UY;CN;PA;RE;TN;BA;ZA;ZM;MG;NG;KE;AD;IQ;QA;SC;MU;CO;GT;CM;GY;SA;PY;BO;KW","prices":{"1GB/7":{"buyPrice":8.06,"ref":"esim_1GB_7D_RGB_V2"},"2GB/15":{"buyPrice":15.56,"ref":"esim_2GB_15D_RGB_V2"},"3GB/30":{"buyPrice":21.78,"ref":"esim_3GB_30D_RGB_V2"},"5GB/30":{"buyPrice":35.94,"ref":"esim_5GB_30D_RGB_V2"},"10GB/30":{"buyPrice":65.97,"ref":"esim_10GB_30D_RGB_V2"},"20GB/30":{"buyPrice":118.52,"ref":"esim_20GB_30D_RGB_V2"}}},
  {"regionName":"Middle East & Africa","isoCode":"EG;IL;JO;MA;OM;TR;AE;KW","prices":{"1GB/7":{"buyPrice":4.11,"ref":"esim_1GB_7D_RME_V2"},"2GB/15":{"buyPrice":7.63,"ref":"esim_2GB_15D_RME_V2"},"3GB/30":{"buyPrice":10.55,"ref":"esim_3GB_30D_RME_V2"},"5GB/30":{"buyPrice":17.21,"ref":"esim_5GB_30D_RME_V2"},"10GB/30":{"buyPrice":31.32,"ref":"esim_10GB_30D_RME_V2"},"20GB/30":{"buyPrice":56.02,"ref":"esim_20GB_30D_RME_V2"},"50GB/30":{"buyPrice":126.58,"ref":"esim_50GB_30D_RME_V2"}}},
  {"regionName":"Middle East and North Africa","isoCode":"AE;BH;EG;IL;MA;SA;TN;QA;JO;KW","prices":{"1GB/7":{"buyPrice":2.71,"ref":"esim_1GB_7D_RMENA_V2"},"2GB/15":{"buyPrice":4.87,"ref":"esim_2GB_15D_RMENA_V2"},"3GB/30":{"buyPrice":6.85,"ref":"esim_3GB_30D_RMENA_V2"},"5GB/30":{"buyPrice":10.19,"ref":"esim_5GB_30D_RMENA_V2"},"10GB/30":{"buyPrice":18.5,"ref":"esim_10GB_30D_RMENA_V2"},"20GB/30":{"buyPrice":33.35,"ref":"esim_20GB_30D_RMENA_V2"},"50GB/30":{"buyPrice":70.55,"ref":"esim_50GB_30D_RMENA_V2"},"100GB/30":{"buyPrice":135.25,"ref":"esim_100GB_30D_RMENA_V2"}}},
  {"regionName":"North America","isoCode":"CA;MX;US","prices":{"1GB/7":{"buyPrice":2.6,"ref":"esim_1GB_7D_RNA_V2"},"2GB/15":{"buyPrice":4.7,"ref":"esim_2GB_15D_RNA_V2"},"3GB/30":{"buyPrice":6.7,"ref":"esim_3GB_30D_RNA_V2"},"5GB/30":{"buyPrice":10.75,"ref":"esim_5GB_30D_RNA_V2"},"10GB/30":{"buyPrice":19.5,"ref":"esim_10GB_30D_RNA_V2"},"20GB/30":{"buyPrice":34,"ref":"esim_20GB_30D_RNA_V2"},"50GB/30":{"buyPrice":74,"ref":"esim_50GB_30D_RNA_V2"},"100GB/30":{"buyPrice":144.3,"ref":"esim_100GB_30D_RNA_V2"}}},
  {"regionName":"Oceania","isoCode":"AU;NZ","prices":{"1GB/7":{"buyPrice":1.66,"ref":"esim_1GB_7D_ROC_V2"},"2GB/15":{"buyPrice":2.48,"ref":"esim_2GB_15D_ROC_V2"},"3GB/30":{"buyPrice":3.19,"ref":"esim_3GB_30D_ROC_V2"},"5GB/30":{"buyPrice":4.56,"ref":"esim_5GB_30D_ROC_V2"},"10GB/30":{"buyPrice":6.84,"ref":"esim_10GB_30D_ROC_V2"},"20GB/30":{"buyPrice":10.9,"ref":"esim_20GB_30D_ROC_V2"},"50GB/30":{"buyPrice":23.59,"ref":"esim_50GB_30D_ROC_V2"},"100GB/30":{"buyPrice":41.35,"ref":"esim_100GB_30D_ROC_V2"}}}
];

function money(value: number) {
  return Number(value.toFixed(2));
}

function parsePlanKey(planKey: string) {
  const [dataPart, validityPart] = planKey.split("/");
  const dataGb = Number(dataPart.replace("GB", ""));
  const validityDays = Number(validityPart);

  return {
    dataGb,
    data: `${dataGb}GB`,
    validityDays,
  };
}

function getUsageFit(dataGb: number) {
  if (dataGb <= 5) return "Light";
  if (dataGb <= 10) return "Standard";
  if (dataGb <= 20) return "Heavy";
  return "Power";
}

function getRole(dataGb: number) {
  if (dataGb >= 50) return "most-data";
  if (dataGb >= 5) return "best-value";
  return "recommended";
}

function getProductCountry(regionName: string) {
  if (regionName === "EU+" || regionName.startsWith("Europe")) {
    return "Europe";
  }

  return regionName;
}

async function upsertRegionalProduct(row: RegionalRow, planKey: string, plan: Plan) {
  const { dataGb, data, validityDays } = parsePlanKey(planKey);
  const country = getProductCountry(row.regionName);

  const productData = {
    country,
    isoCode: row.isoCode,
    region: row.regionName,
    name: `${row.regionName} eSIM ${data} / ${validityDays} days`,
    data,
    validityDays,
    planType: "Fixed",
    usageFit: getUsageFit(dataGb),
    role: getRole(dataGb),
    buyPrice: plan.buyPrice,
    sellPrice: money(plan.buyPrice * SELL_MULTIPLIER),
    oldPrice: null,
    provider: "eSIM Go",
    providerProductId: plan.ref,
    image: "/dalo-logo.png",
    description: `${data} mobile data for ${row.regionName}. Valid for ${validityDays} days.`,
    active: true,
  };

  const existing = await prisma.product.findFirst({
    where: {
      providerProductId: plan.ref,
    },
  });

  if (existing) {
    await prisma.product.update({
      where: {
        id: existing.id,
      },
      data: productData,
    });

    return "updated";
  }

  await prisma.product.create({
    data: productData,
  });

  return "created";
}

async function main() {
  let created = 0;
  let updated = 0;

  for (const row of regionalRows) {
    for (const [planKey, plan] of Object.entries(row.prices)) {
      const result = await upsertRegionalProduct(row, planKey, plan);

      if (result === "created") created++;
      if (result === "updated") updated++;
    }
  }

  console.log({
    regionalBundles: regionalRows.length,
    created,
    updated,
    total: created + updated,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
