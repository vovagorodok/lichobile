import redraw from '../../../utils/redraw'
import * as cg from '../../../chessground/interfaces'
import * as helper from '../../helper'
import settings from '../../../settings'
import h from 'mithril/hyperscript'
import { PromotingInterface } from '../round'
import { noop } from '~/utils'
import { State } from '../../../chessground/state'

type PromoteCallback = (orig: Key, dest: Key, prom: Role) => void
export interface Promoting {
  orig: Key
  dest: Key
  callback: PromoteCallback
}

export function canPromote(state: State, dest: Key) {
  const piece = state.pieces.get(dest)
  return piece && piece.role === 'pawn' &&
         ((dest[1] === '1' && state.turnColor === 'white') ||
          (dest[1] === '8' && state.turnColor === 'black'))
}

function start(ctrl: PromotingInterface, orig: Key, dest: Key, callback: PromoteCallback) {
  if (canPromote(ctrl.chessground.state, dest)) {
    ctrl.promoting = {
      orig: orig,
      dest: dest,
      callback: callback
    }
    redraw()
    return true
  }
  return false
}

function finish(ctrl: PromotingInterface, role: Role) {
  const promoting = ctrl.promoting
  if (promoting) {
    ctrl.chessground.promote(promoting.dest, role)
    promoting.callback(promoting.orig, promoting.dest, role)
  }
  ctrl.promoting = null
}

function cancel(ctrl: PromotingInterface, cgConfig?: cg.SetConfig) {
  if (ctrl.promoting) {
    ctrl.promoting = null
    if (cgConfig) ctrl.chessground.set(cgConfig)
    redraw()
  }
}

function otbPromoPieceTransform(ctrl: PromotingInterface): string {
  if (ctrl.data.game.id === 'offline_otb') {
    const state = ctrl.chessground.state
    if ((state.orientation === 'white' && ctrl.player() === 'black') ||
      (state.orientation === 'black' && ctrl.player() === 'white')) {
      return 'rotate(180deg)'
    }
  }

  return ''
}

export function view<T extends PromotingInterface>(ctrl: T, cancelCallback: (ctrl: T) => void = noop) {
  if (!ctrl.promoting) return null

  const pieces: Role[] = ['queen', 'knight', 'rook', 'bishop']
  if (ctrl.data.game.variant.key === 'antichess') {
    pieces.push('king')
  }

  return h('div.overlay.open', {
    oncreate: helper.ontap(() => cancelCallback(ctrl))
  }, [h('div#promotion_choice', {
    className: settings.general.theme.piece(),
    style: { top: `${(helper.viewportDim().vh - 100) / 2}px` }
  }, pieces.map((role: Role) => {
    return h('piece.' + role + '.' + ctrl.player(), {
      style: {transform: otbPromoPieceTransform(ctrl)},
      oncreate: helper.ontap(() => finish(ctrl, role))
    })
  }))])
}

export default {
  canPromote,
  start,
  cancel,
  view
}
