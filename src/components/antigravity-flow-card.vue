<script setup lang="ts">
import type { VNode } from 'vue';
import { computed, h, mergeProps, nextTick, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import MaterialSymbolsAdd from '../assets/MaterialSymbolsAdd.svg';
import MaterialSymbolsAttachFile from '../assets/MaterialSymbolsAttachFile.svg';
import MaterialSymbolsChangeHistoryOutline from '../assets/MaterialSymbolsChangeHistoryOutline.svg';
import MaterialSymbolsCircleOutline from '../assets/MaterialSymbolsCircleOutline.svg';
import MaterialSymbolsPentagonOutline from '../assets/MaterialSymbolsPentagonOutline.svg';

/**
 * 反重力流动画卡片
 *
 * @shapes: 自定义动画元素，VNode类型数组，默认使用内置动画元素
 * @color: 动画元素颜色，默认黑色
 * @size: 动画元素大小，默认30px
 */
interface Props {
  shapes?: VNode[];
  color?: string;
  size?: number;
}

defineOptions({ name: 'AntigravityFlowCard' });

const props = withDefaults(defineProps<Props>(), {
  shapes: () => [],
  color: '#000000',
  size: 30
});

const icons = [
  MaterialSymbolsAdd,
  MaterialSymbolsAttachFile,
  MaterialSymbolsChangeHistoryOutline,
  MaterialSymbolsCircleOutline,
  MaterialSymbolsPentagonOutline
];
const timer = ref<any>(0);
const isPaused = ref<boolean>(false);
const contentRef = ref<HTMLElement>();
const particles = shallowRef<VNode[]>([]);
const steps = computed<number>(() => (contentRef.value?.clientHeight ?? 0) / 2);

/** 初始化生成动画元素 */
function init() {
  nextTick(() => {
    const generateParticle = () => {
      const extra = {
        siner: Math.random() * 200,
        scale: Math.random() + 0.5,
        rotation: Math.random() > 0.5 ? '-' : '+',
        x: Math.floor(Math.random() * (contentRef.value?.clientWidth ?? 0)),
        y: contentRef.value?.clientHeight ?? 0
      };

      if (props.shapes.length) {
        return h(props.shapes[Math.floor(Math.random() * icons.length)], {
          extra,
          style: {
            position: 'absolute',
            transform: `translate(${extra.x}px, ${extra.y}px)`
          }
        });
      }
      return h('img', {
        extra,
        src: icons[Math.floor(Math.random() * icons.length)],
        style: {
          color: props.color,
          position: 'absolute',
          fontSize: `${props.size}px`,
          transform: `translate(${extra.x}px, ${extra.y}px)`
        }
      });
    };

    const updateParticles = () => {
      particles.value = particles.value.filter(particle => {
        return move(particle);
      });
      requestAnimationFrame(updateParticles);
    };

    timer.value = setInterval(() => {
      if (!isPaused.value) {
        particles.value.push(generateParticle());
      }
    }, 200);
    updateParticles();
  });
}

/** 更新元素动画轨迹 */
function move(particle: VNode) {
  const { x = 0, y = 0, rotation = '+', siner, scale } = particle.props!.extra;
  const top = y - (Math.random() + 0.5);
  const left = x + Math.sin((top * Math.PI) / steps.value) * siner;

  particle.props = mergeProps(particle.props ?? {}, {
    style: {
      transform: `translate(${left}px, ${top}px) scale(${scale}) rotate(${rotation}${top + props.size}deg)`
    },
    extra: {
      ...particle.props!.extra,
      y: top
    }
  });

  if (top < -props.size) {
    destroy(particle);
    return false;
  }
  return true;
}

/** 销毁动画元素 */
function destroy(particle: VNode) {
  particles.value = particles.value.filter(item => item !== particle);
}

onMounted(() => {
  init();

  window.onblur = () => {
    isPaused.value = true;
  };

  window.onfocus = () => {
    isPaused.value = false;
  };
});

onUnmounted(() => {
  clearInterval(timer.value);
});
</script>

<template>
  <NCard class="afc-card" content-class="afc-card-content">
    <div class="afc-background">
      <component :is="particle" v-for="(particle, index) in particles" :key="index" />
    </div>

    <div ref="contentRef" class="afc-content">
      <slot name="default" />
    </div>
  </NCard>
</template>

<style scoped lang="css">
.afc-card {
  width: 100%;
  overflow: hidden;
}

::v-deep(.afc-card-content) {
  width: 100%;
  height: 100%;
  padding: 0 !important;
  position: relative;
}

.afc-background {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 0;
}

.afc-content {
  width: 100%;
  position: relative;
  z-index: 2;
}
</style>
