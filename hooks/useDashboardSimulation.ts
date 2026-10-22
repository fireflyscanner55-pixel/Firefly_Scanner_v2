"use client";
import {useEffect,useMemo,useState} from "react";
import type {DeviceConfig,SimulationConfig} from "@/types/radioanalysis";
import type {ResultCardData,CombinedChartPoint,LineChartPoint} from "@/types/dashboard";
type Metrics={cps:number;doseRate:number;battery:number;temperature:number;pressure:number};
type DashboardResponse={simulationId:string;scenarioType:string;scenarioName:string;results:Metrics;units:Record<string,string>;isotopes:unknown[];impression:unknown[];location:string;startedAt:string};
export function useDashboardSimulation(){
 const [snapshot,setSnapshot]=useState<DashboardResponse|null>(null);
 const [isLoading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null);
 useEffect(()=>{let cancelled=false;fetch("/api/dashboard",{cache:"no-store"}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.message??"Cannot load results");if(!cancelled)setSnapshot(data);}).catch(e=>{if(!cancelled)setError(e.message);}).finally(()=>{if(!cancelled)setLoading(false);});return()=>{cancelled=true;};},[]);
 const metrics=snapshot?.results??{cps:0,doseRate:0,battery:0,temperature:0,pressure:0};
 // Display only backend-provided stable values. Alpha/Beta/Gamma are not inferred from CPS.
 const resultCards:ResultCardData[]=[{id:"cps",title:"CPS",color:"#3b82c4",data:Array(8).fill({value:metrics.cps})},{id:"dose",title:"Dose Rate",color:"#e33131",data:Array(8).fill({value:metrics.doseRate})},{id:"battery",title:"Battery",color:"#16a02b",data:Array(8).fill({value:metrics.battery})}];
 const chartData=useMemo(()=>Array.from({length:8},(_,i)=>({label:String(i),alpha:0,beta:0,gamma:0})),[]);
 const device:DeviceConfig|null=snapshot?{id:snapshot.simulationId,deviceName:"Radiation Scanner",location:snapshot.location,status:"online"}:null;
 return {resultCards,combinedChartData:chartData as CombinedChartPoint[],lineChartData:chartData as LineChartPoint[],device,currentCps:metrics.cps,currentDoseRate:metrics.doseRate,currentBattery:metrics.battery,currentTemperature:metrics.temperature,currentPressure:metrics.pressure,impression:snapshot?.impression??{title:"",description:""},config:null as SimulationConfig|null,isRunning:!!snapshot,isLoading,error,scenarioId:snapshot?.scenarioType??""};
}
