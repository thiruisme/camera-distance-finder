import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CameraDistanceCalculator: React.FC = () => {
  const [isDragging, setIsDragging] = useState<'camera' | 'subject' | null>(null);
  const [cameraPos, setCameraPos] = useState({ x: 50, y: 150 });
  const [subjectPos, setSubjectPos] = useState({ x: 250, y: 150 });
  const [subjectHeight, setSubjectHeight] = useState(100);
  const [manualSensorHeight, setManualSensorHeight] = useState(24);
  const [manualSubjectHeight, setManualSubjectHeight] = useState(1000);
  const [manualDistance, setManualDistance] = useState(2);
  const svgRef = useRef<SVGSVGElement>(null);

  const calculateDistance = () => {
    const dx = subjectPos.x - cameraPos.x;
    return (dx / 100).toFixed(2);
  };

  const calculateSensorHeight = () => {
    const baseHeight = 24;
    const normalizedY = (150 - cameraPos.y) / 50;
    return Math.max(5, Math.round(baseHeight * (1 + normalizedY)));
  };

  const calculateSubjectHeight = () => {
    return Math.round(subjectHeight * 10);
  };

  const calculateFOV = (sensorHeight: number, distance: number) => {
    const focalLength = Math.max(20, Math.round(distance * 50));
    return (2 * Math.atan(sensorHeight / (2 * focalLength)) * 180 / Math.PI).toFixed(1);
  };

  const handleMouseDown = (element: 'camera' | 'subject') => {
    setIsDragging(element);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    if (isDragging === 'camera') {
      setCameraPos({
        x: Math.max(30, Math.min(x, subjectPos.x - 50)),
        y: Math.max(50, Math.min(y, 250))
      });
    } else {
      setSubjectPos({
        x: Math.max(cameraPos.x + 50, Math.min(x, 370)),
        y: 150
      });
      setSubjectHeight(Math.max(20, Math.min(Math.abs(y - 150) * 2, 200)));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const Diagram = () => {
    const fov = Number(calculateFOV(calculateSensorHeight(), Number(calculateDistance())));
    const fovRadians = (fov * Math.PI) / 180;
    const dx = subjectPos.x - cameraPos.x;
    const fovHeight = dx * Math.tan(fovRadians/2);

    return (
      <svg 
        ref={svgRef}
        viewBox="0 0 400 300" 
        className="w-full h-48 bg-white cursor-move"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g onMouseDown={() => handleMouseDown('camera')} style={{ cursor: 'move' }}>
          <rect x={cameraPos.x-10} y={cameraPos.y-15} width="20" height="30" 
                fill={isDragging === 'camera' ? '#666' : '#333'} />
          <text x={cameraPos.x-15} y={cameraPos.y-20} fontSize="12">
            {calculateSensorHeight()}mm
          </text>
        </g>
        
        <line x1={cameraPos.x} y1={cameraPos.y} 
              x2={subjectPos.x} y2={subjectPos.y - subjectHeight/2} 
              stroke="#666" strokeDasharray="4" />
        <line x1={cameraPos.x} y1={cameraPos.y} 
              x2={subjectPos.x} y2={subjectPos.y + subjectHeight/2} 
              stroke="#666" strokeDasharray="4" />
        
        <g onMouseDown={() => handleMouseDown('subject')} style={{ cursor: 'move' }}>
          <line x1={subjectPos.x} y1={subjectPos.y - subjectHeight/2} 
                x2={subjectPos.x} y2={subjectPos.y + subjectHeight/2} 
                stroke={isDragging === 'subject' ? '#66f' : '#00f'} strokeWidth="3" />
          <text x={subjectPos.x+15} y={subjectPos.y} fontSize="12">
            {calculateSubjectHeight()}mm
          </text>
        </g>
        
        <line x1={cameraPos.x} y1={cameraPos.y+40} 
              x2={subjectPos.x} y2={cameraPos.y+40} 
              stroke="#000" strokeWidth="1" />
        <text x={(cameraPos.x + subjectPos.x)/2} y={cameraPos.y+55} textAnchor="middle">
          {calculateDistance()}m
        </text>
      </svg>
    );
  };

  return (
    <Card className="w-full max-w-lg bg-background">
      <CardHeader>
        <CardTitle>Interactive Camera Distance Calculator</CardTitle>
        <p className="text-sm text-gray-500">See how far the camera should be to have the entire object fill the frame</p>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-muted rounded mb-4">
            <p className="text-lg font-medium">
              Required Distance: {calculateDistance()} meters
            </p>
            <p className="mt-2">
              Sensor Height: {calculateSensorHeight()}mm
            </p>
            <p>
              Subject Height: {calculateSubjectHeight()}mm
            </p>
            <p className="text-sm text-gray-600">
              Field of View: {calculateFOV(calculateSensorHeight(), Number(calculateDistance()))}°
            </p>
          </div>

        <Tabs defaultValue="interactive">
          <TabsList>
            <TabsTrigger value="interactive">Interactive</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="interactive">
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-2">
                Drag camera ◼️ up/down to adjust sensor height
                <br />
                Drag subject 📏 up/down to adjust subject height
              </div>
              
              <div className="mt-6">
                <Diagram />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sensor Height (mm)
                </label>
                <Input
                  type="number"
                  value={manualSensorHeight}
                  onChange={(e) => setManualSensorHeight(Number(e.target.value))}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject Height (mm)
                </label>
                <Input
                  type="number"
                  value={manualSubjectHeight}
                  onChange={(e) => setManualSubjectHeight(Number(e.target.value))}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Distance (meters)
                </label>
                <Input
                  type="number"
                  value={manualDistance}
                  onChange={(e) => setManualDistance(Number(e.target.value))}
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CameraDistanceCalculator;