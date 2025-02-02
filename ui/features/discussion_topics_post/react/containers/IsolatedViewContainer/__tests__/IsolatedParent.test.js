/*
 * Copyright (C) 2021 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {Discussion} from '../../../../graphql/Discussion'
import {DiscussionEntry} from '../../../../graphql/DiscussionEntry'
import {fireEvent, render} from '@testing-library/react'
import {IsolatedParent} from '../IsolatedParent'
import React from 'react'

describe('IsolatedParent', () => {
  const defaultProps = ({discussionEntryOverrides = {}, overrides = {}} = {}) => ({
    discussionTopic: Discussion.mock(),
    discussionEntry: DiscussionEntry.mock(discussionEntryOverrides),
    onToggleUnread: jest.fn(),
    ...overrides
  })

  const setup = props => {
    return render(<IsolatedParent {...props} />)
  }

  describe('thread actions menu', () => {
    it('allows toggling the unread state of an entry', () => {
      const onToggleUnread = jest.fn()
      const {getByTestId} = setup(defaultProps({overrides: {onToggleUnread}}))

      fireEvent.click(getByTestId('thread-actions-menu'))
      fireEvent.click(getByTestId('markAsUnread'))

      expect(onToggleUnread).toHaveBeenCalled()
    })

    it('only shows the delete option if you have permission', () => {
      const props = defaultProps({overrides: {onDelete: jest.fn()}})
      props.discussionEntry.permissions.delete = false
      const {getByTestId, queryByTestId} = setup(props)

      fireEvent.click(getByTestId('thread-actions-menu'))
      expect(queryByTestId('delete')).toBeNull()
    })

    it('allows deleting an entry', () => {
      const onDelete = jest.fn()
      const {getByTestId} = setup(defaultProps({overrides: {onDelete}}))

      fireEvent.click(getByTestId('thread-actions-menu'))
      fireEvent.click(getByTestId('delete'))

      expect(onDelete).toHaveBeenCalled()
    })

    it('only shows the speed grader option if you have permission', () => {
      const props = defaultProps({overrides: {onOpenInSpeedGrader: jest.fn()}})
      props.discussionTopic.permissions.speedGrader = false
      const {getByTestId, queryByTestId} = setup(props)

      fireEvent.click(getByTestId('thread-actions-menu'))
      expect(queryByTestId('inSpeedGrader')).toBeNull()
    })

    it('allows opening an entry in speedgrader', () => {
      const onOpenInSpeedGrader = jest.fn()
      const {getByTestId} = setup(defaultProps({overrides: {onOpenInSpeedGrader}}))

      fireEvent.click(getByTestId('thread-actions-menu'))
      fireEvent.click(getByTestId('inSpeedGrader'))

      expect(onOpenInSpeedGrader).toHaveBeenCalled()
    })
  })

  describe('Expand-Button', () => {
    it('should render expand when nested replies are present', () => {
      const {getByTestId} = setup(defaultProps())
      expect(getByTestId('expand-button')).toBeTruthy()
    })

    it('displays unread and replyCount', async () => {
      const {queryByText} = setup(
        defaultProps({
          discussionEntryOverrides: {rootEntryParticipantCounts: {unreadCount: 1, repliesCount: 2}}
        })
      )
      expect(queryByText('2 replies, 1 unread')).toBeTruthy()
    })

    it('does not display unread count if it is 0', async () => {
      const {queryByText} = setup(
        defaultProps({
          discussionEntryOverrides: {rootEntryParticipantCounts: {unreadCount: 0, repliesCount: 2}}
        })
      )
      expect(queryByText('2 replies, 0 unread')).toBeFalsy()
      expect(queryByText('2 replies')).toBeTruthy()
    })
  })
})
