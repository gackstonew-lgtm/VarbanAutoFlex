import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Zod Schema for Demo Vehicle Validation
const DemoVehicleSchema = z.object({
  demo_source_id: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  variant: z.string().optional(),
  year: z.number().int().min(1990).max(2030),
  price: z.number().positive(),
  currency: z.string().default('KES'),
  mileage: z.number().min(0),
  engine_cc: z.number().positive(),
  fuel_type: z.enum(['Petrol', 'Diesel', 'Hybrid', 'Electric']),
  transmission: z.enum(['Automatic', 'Manual', 'CVT']),
  body_type: z.enum(['SUV', 'Sedan', 'Hatchback', 'Station Wagon', 'Pickup / Truck', 'Van / Minibus', 'Coupe / Convertible']),
  drive_type: z.enum(['2WD', '4WD', 'AWD', 'RWD']).default('4WD'),
  color: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(10),
  featured: z.boolean().default(false),
  dealer_name: z.string().default('Verified Dealer'),
  images: z.array(
    z.object({
      image_url: z.string().url().or(z.literal('')),
      is_primary: z.boolean().default(false),
      license_status: z.enum(['authorized', 'pending', 'unknown']).default('pending'),
      source_type: z.enum(['authorized_external', 'supabase_storage', 'admin_uploaded', 'demo']).default('demo')
    })
  ).default([])
});

type DemoVehicleInput = z.infer<typeof DemoVehicleSchema>;

// Server Data Import Runner
export async function runDemoVehicleImport(dataset: DemoVehicleInput[]) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[Importer Warning] Supabase environment keys unconfigured. Importer validated dataset only.');
    return { success: true, count: dataset.length };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let successCount = 0;
  let failCount = 0;

  for (const item of dataset) {
    // 1. Zod Validation
    const validation = DemoVehicleSchema.safeParse(item);
    if (!validation.success) {
      console.error(`❌ [Import Validation Failed] ${item.demo_source_id}:`, validation.error.format());
      failCount++;
      continue;
    }

    const validData = validation.data;

    // 2. Upsert Vehicle Record into Supabase
    const { data: vehicle, error: vehicleErr } = await supabase
      .from('vehicles')
      .upsert(
        {
          demo_source_id: validData.demo_source_id,
          make: validData.make,
          model: validData.model,
          variant: validData.variant,
          year: validData.year,
          price: validData.price,
          currency: validData.currency,
          mileage: validData.mileage,
          engine_cc: validData.engine_cc,
          fuel_type: validData.fuel_type,
          transmission: validData.transmission,
          body_type: validData.body_type,
          drive_type: validData.drive_type,
          color: validData.color,
          location: validData.location,
          description: validData.description,
          featured: validData.featured,
          dealer_name: validData.dealer_name,
          status: 'active',
          verification_status: 'verified',
          logbook_verified: true,
          is_demo: true,
          data_source: 'demo',
          source_reference: 'CarDuka reference'
        },
        { onConflict: 'demo_source_id' }
      )
      .select()
      .single();

    if (vehicleErr || !vehicle) {
      console.error(`❌ [Supabase Vehicle Upsert Error] ${validData.demo_source_id}:`, vehicleErr);
      failCount++;
      continue;
    }

    // 3. Upsert Vehicle Images
    if (validData.images.length > 0) {
      const imageRecords = validData.images.map((img, i) => ({
        vehicle_id: vehicle.id,
        image_url: img.image_url,
        is_primary: img.is_primary || i === 0,
        display_order: i + 1,
        source_type: img.source_type,
        license_status: img.license_status
      }));

      await supabase.from('vehicle_images').delete().eq('vehicle_id', vehicle.id);
      await supabase.from('vehicle_images').insert(imageRecords);
    }

    console.log(`✅ [Imported Successfully] ${validData.year} ${validData.make} ${validData.model} (${validData.demo_source_id})`);
    successCount++;
  }

  console.log(`\nImport Summary: ${successCount} Imported / Updated, ${failCount} Failed.`);
  return { success: true, count: successCount, failed: failCount };
}
