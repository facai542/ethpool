"use client";
import { WorldMap } from "@/components/ui/map";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";

export default function MapDemo() {
  const { t } = useI18n();
  
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto text-center mb-8">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t.globalMiningNetwork}
        </motion.h2>
        <motion.p 
          className="text-gray-400 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t.globalMiningNetworkDescription}
        </motion.p>
      </div>
      <WorldMap
        dots={[
          {
            start: {
              lat: 39.9042,
              lng: 116.4074,
              label: "BJ"
            },
            end: {
              lat: 40.7128,
              lng: -74.0060,
              label: "NYC"
            },
          },
          {
            start: { 
              lat: 35.6762, 
              lng: 139.6503,
              label: "TYO"
            },
            end: { 
              lat: 51.5074, 
              lng: -0.1278,
              label: "LON"
            },
          },
          {
            start: { 
              lat: 1.3521, 
              lng: 103.8198,
              label: "SG"
            },
            end: { 
              lat: -33.8688, 
              lng: 151.2093,
              label: "SYD"
            },
          },
          {
            start: { 
              lat: 25.2048, 
              lng: 55.2708,
              label: "DUB"
            },
            end: { 
              lat: 52.5200, 
              lng: 13.4050,
              label: "BER"
            },
          },
          {
            start: { 
              lat: -23.5505, 
              lng: -46.6333,
              label: "SP"
            },
            end: { 
              lat: 37.7749, 
              lng: -122.4194,
              label: "SFC"
            },
          },
          {
            start: { 
              lat: 19.4326, 
              lng: -99.1332,
              label: "CDMX"
            },
            end: { 
              lat: 55.7558, 
              lng: 37.6176,
              label: "Moscow"
            },
          },
        ]}
        lineColor="#F59E0B"
        showLabels={true}
        animationDuration={3}
        loop={true}
      />
    </div>
  );
}
