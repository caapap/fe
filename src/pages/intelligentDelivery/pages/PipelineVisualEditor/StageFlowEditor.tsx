import React, { useState } from 'react';
import { Button, Input, Tooltip } from 'antd';
import { PlusOutlined, ThunderboltOutlined, PauseCircleOutlined, EditOutlined } from '@ant-design/icons';
import TaskTypeSelectorDrawer from '../../components/TaskTypeSelector';
import { TaskOption } from '../../components/TaskTypeSelector/options';
import StepConfigDrawer from './panels/StepConfigDrawer';
import './StageFlowEditor.less';

interface Job {
  id: string;
  name: string;
  stepType: string;
  driven: 'AUTO' | 'MANUAL';
  config?: Record<string, any>;
}

interface Stage {
  id: string;
  name: string;
  jobs: Job[];
}

export default function StageFlowEditor() {
  const [stages, setStages] = useState<Stage[]>([
    {
      id: 'stage_1',
      name: '阶段1',
      jobs: [
        { id: 'job_1', name: '空任务', stepType: 'shell-exec', driven: 'AUTO' },
      ],
    },
    {
      id: 'stage_2',
      name: '测试',
      jobs: [
        { id: 'job_2', name: 'Python 单元测试', stepType: 'shell-exec', driven: 'MANUAL' },
      ],
    },
    {
      id: 'stage_3',
      name: '新阶段',
      jobs: [
        { id: 'job_3', name: '新的任务', stepType: 'shell-exec', driven: 'AUTO' },
      ],
    },
  ]);

  const [taskSelectorOpen, setTaskSelectorOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ stageId: string; jobId: string; position: 'before' | 'after' | 'parallel' } | null>(null);
  const [selectedStageForNew, setSelectedStageForNew] = useState<string | null>(null);
  const [configDrawerJob, setConfigDrawerJob] = useState<Job | null>(null);
  const [pendingJobForConfig, setPendingJobForConfig] = useState<Job | null>(null);

  const handleAddSerialTask = (stageId: string, jobId: string, position: 'before' | 'after') => {
    setSelectedJob({ stageId, jobId, position });
    setTaskSelectorOpen(true);
  };

  const handleAddParallelTask = (stageId: string, jobId: string) => {
    setSelectedJob({ stageId, jobId, position: 'parallel' });
    setTaskSelectorOpen(true);
  };

  const handleAddStage = (afterStageId: string) => {
    setSelectedStageForNew(afterStageId);
    setTaskSelectorOpen(true);
  };

  const handleTaskSelect = (opt: TaskOption) => {
    const newJob: Job = {
      id: `job_${Date.now()}`,
      name: opt.title,
      stepType: opt.kind,
      driven: 'AUTO',
    };

    // 如果是添加新阶段
    if (selectedStageForNew) {
      const newStage: Stage = {
        id: `stage_${Date.now()}`,
        name: '新阶段',
        jobs: [newJob],
      };
      const index = stages.findIndex((s) => s.id === selectedStageForNew);
      const newStages = [...stages];
      newStages.splice(index + 1, 0, newStage);
      setStages(newStages);
      setSelectedStageForNew(null);
    }
    // 如果是添加串行/并行任务
    else if (selectedJob) {
      setStages((prev) =>
        prev.map((stage) => {
          if (stage.id !== selectedJob.stageId) return stage;

          if (selectedJob.position === 'parallel') {
            return { ...stage, jobs: [...stage.jobs, newJob] };
          }

          const jobIndex = stage.jobs.findIndex((j) => j.id === selectedJob.jobId);
          const newJobs = [...stage.jobs];
          if (selectedJob.position === 'before') {
            newJobs.splice(jobIndex, 0, newJob);
          } else {
            newJobs.splice(jobIndex + 1, 0, newJob);
          }
          return { ...stage, jobs: newJobs };
        }),
      );
      setSelectedJob(null);
    }

    setTaskSelectorOpen(false);

    // 自动打开配置抽屉
    setPendingJobForConfig(newJob);
    setTimeout(() => {
      setConfigDrawerJob(newJob);
    }, 100);
  };

  const toggleDriven = (stageId: string, jobId: string) => {
    setStages((prev) =>
      prev.map((stage) => {
        if (stage.id !== stageId) return stage;
        return {
          ...stage,
          jobs: stage.jobs.map((job) =>
            job.id === jobId ? { ...job, driven: job.driven === 'AUTO' ? 'MANUAL' : 'AUTO' } : job,
          ),
        };
      }),
    );
  };

  const handleRenameStage = (stageId: string, newName: string) => {
    setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, name: newName } : s)));
  };

  return (
    <div className='stage-flow-editor'>
      <div className='stages-container'>
        {stages.map((stage, stageIndex) => (
          <React.Fragment key={stage.id}>
            <div className='stage-column'>
              <div className='stage-header'>
                <Input
                  defaultValue={stage.name}
                  bordered={false}
                  className='stage-name-input'
                  onBlur={(e) => handleRenameStage(stage.id, e.target.value)}
                  suffix={<EditOutlined className='text-[var(--fc-text-4)]' />}
                />
              </div>

              <div className='jobs-container'>
                {stage.jobs.map((job, jobIndex) => (
                  <div key={job.id} className='job-row'>
                    {/* 串行任务前加号 */}
                    {jobIndex === 0 && (
                      <Tooltip title='添加串行任务'>
                        <Button
                          type='text'
                          shape='circle'
                          size='small'
                          icon={<PlusOutlined />}
                          className='add-serial-btn'
                          onClick={() => handleAddSerialTask(stage.id, job.id, 'before')}
                        />
                      </Tooltip>
                    )}

                    {/* 自动/手动触发切换 */}
                    <Tooltip title={job.driven === 'AUTO' ? '自动触发' : '手动触发'}>
                      <Button
                        type='text'
                        shape='circle'
                        icon={job.driven === 'AUTO' ? <ThunderboltOutlined /> : <PauseCircleOutlined />}
                        className='driven-toggle-btn'
                        onClick={() => toggleDriven(stage.id, job.id)}
                      />
                    </Tooltip>

                    {/* 任务节点 */}
                    <div className='job-node' onClick={() => setConfigDrawerJob(job)}>
                      <span>{job.name}</span>
                    </div>

                    {/* 串行任务后加号 */}
                    <Tooltip title='添加串行任务'>
                      <Button
                        type='text'
                        shape='circle'
                        size='small'
                        icon={<PlusOutlined />}
                        className='add-serial-btn'
                        onClick={() => handleAddSerialTask(stage.id, job.id, 'after')}
                      />
                    </Tooltip>
                  </div>
                ))}

                {/* 并行任务添加 */}
                <Tooltip title='添加并行任务'>
                  <Button
                    type='dashed'
                    icon={<PlusOutlined />}
                    className='add-parallel-btn'
                    onClick={() => handleAddParallelTask(stage.id, stage.jobs[0]?.id)}
                  >
                    并行任务
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* 阶段间分割线 + 添加新阶段 */}
            {stageIndex < stages.length - 1 && (
              <div className='stage-divider'>
                <Tooltip title='添加新阶段'>
                  <Button
                    type='text'
                    shape='circle'
                    icon={<PlusOutlined />}
                    className='add-stage-btn'
                    onClick={() => handleAddStage(stage.id)}
                  />
                </Tooltip>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <TaskTypeSelectorDrawer
        open={taskSelectorOpen}
        onClose={() => setTaskSelectorOpen(false)}
        onSelect={handleTaskSelect}
      />

      <StepConfigDrawer
        node={
          configDrawerJob
            ? ({
                id: configDrawerJob.id,
                data: {
                  label: configDrawerJob.name,
                  stepType: configDrawerJob.stepType,
                  config: configDrawerJob.config,
                },
              } as any)
            : null
        }
        onClose={() => setConfigDrawerJob(null)}
      />
    </div>
  );
}
